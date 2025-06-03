import BiddingProduct from '../models/biddingProduct.js';
import Bid from '../models/bid.js';
import User from '../models/user.js';
import Notification from '../models/notifications.js';

export async function checkEndedAuctions(io) {
  const now = new Date();
  
  // Find auctions that have just ended (ended in the last minute)
  const endedAuctions = await BiddingProduct.find({
    bidEndTime: { 
      $lte: now, 
      $gte: new Date(now.getTime() - 60000) // 1 minute ago
    },

     // Add a flag to prevent processing the same auction multiple times
    notificationsProcessed: { $ne: true } 
  });
  console.log('Ended auctions:', endedAuctions);
  
  if (endedAuctions.length === 0) return;

  const auctionIds = endedAuctions.map(a => a._id);
  await BiddingProduct.updateMany(
    { _id: { $in: auctionIds } },
    { $set: { notificationsProcessed: true } }
  );


  for (const auction of endedAuctions) {
    // Process winners based on bidding model
    if (auction.biddingModel === "Highest Bidder") {
      await processHighestBidder(auction, io);
    } else if (auction.biddingModel === "Top 3 Bidders") {
      await processTopBidders(auction, io, 3);
    }


    await BiddingProduct.findByIdAndUpdate(auction._id, {
        notificationsProcessed: true
      });
  }
}

async function processHighestBidder(auction, io) {
  // Get highest bid - removed the populate since 'name' is just a string
  const highestBid = await Bid.findOne({ productId: auction._id })
    .sort({ bidAmount: -1 });

  console.log('Highest bid:', highestBid);  
  
  if (highestBid) {
    await notifyWinner(auction, highestBid, io, `Congratulations! You won the auction ${auction.name}`);
  }
}


async function processTopBidders(auction, io, count) {
  // Get top N bids or as many as are available
  const topBids = await Bid.find({ productId: auction._id })
    .sort({ bidAmount: -1 })
    .limit(count);
  
  // If no bids were placed
  if (topBids.length === 0) {
    console.log(`No bids were placed for auction: ${auction.name}`);
    
    // Notify seller that no one bid on their item
    try {
      const seller = await User.findById(auction.owner);
      if (seller) {
        const sellerNotification = new Notification({
          recipient: auction.owner,
          product: auction._id,
          title: 'Auction Ended - No Bids',
          description: `Your auction for ${auction.name} has ended. No bids were placed.`,
          type: 'auction'
        });
        await sellerNotification.save();
        
        if (io) {
          io.to(seller._id.toString()).emit('new_notification', {
            ...sellerNotification.toObject(),
            time: 'Just now'
          });
        }
      }
    } catch (error) {
      console.error('Error notifying seller of no bids:', error);
    }
    return;
  }
  
  // Notify winners
  for (let i = 0; i < topBids.length; i++) {
    const position = i + 1;
    const message = `Congratulations! You are #${position} in the auction for ${auction.name}`;
    await notifyWinner(auction, topBids[i], io, message);
  }
  
  // Also notify the seller about how many winners were selected
  try {
    const seller = await User.findById(auction.owner);
    if (seller) {
      const winnerCount = topBids.length;
      const sellerMessage = `Your "Top 3 Bidders" auction for ${auction.name} has ended with ${winnerCount} ${winnerCount === 1 ? 'winner' : 'winners'}.`;
      
      // This notification is in addition to the individual notifications for each winner
      // that are created in the notifyWinner function
      const additionalSellerNotification = new Notification({
        recipient: auction.owner,
        product: auction._id,
        title: 'Auction Summary',
        description: sellerMessage,
        type: 'auction_summary'
      });
      await additionalSellerNotification.save();
      
      if (io) {
        io.to(seller._id.toString()).emit('new_notification', {
          ...additionalSellerNotification.toObject(),
          time: 'Just now'
        });
      }
    }
  } catch (error) {
    console.error('Error sending auction summary to seller:', error);
  }
}

async function notifyWinner(auction, bid, io, message) {
  try {
    // Get user info - using bidderId instead of name
    const bidder = await User.findById(bid.bidderId);
    console.log('Bidder:', bidder);
    const seller = await User.findById(auction.owner);
    console.log('Seller:', seller);
    // if (!bidder || !seller) {
    //   console.log(`Bidder (${bid.bidderId}) or seller (${auction.owner}) not found`);
    //   return;
    // }
    
    // Create notification for the winner

    const existingBidderNotification = await Notification.findOne({
      recipient: bidder._id,
      product: auction._id,
      type: 'auction',
      // Only look at recent notifications (last few minutes)
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });
    

   if (!existingBidderNotification) {
    const winnerNotification = new Notification({
      recipient: bidder._id,
 
      product: auction._id,
      title: 'Auction Won!',
      description: message,
      type: 'auction'
    });
    console.log('Winner notification:', winnerNotification);
    await winnerNotification.save();
    console.log('Winner notification saved:', winnerNotification);

    if (io) {
      // To winner  
     io.to(bidder._id.toString()).emit('new_notification', {
        ...winnerNotification.toObject(),
        time: 'Just now'
      });
    }
      

   }  else{
    console.log('Bidder already notified within the last 5 minutes:', existingBidderNotification);
   }


    // IMPORTANT: Check if a seller notification already exists for this auction and bidder
    const existingSellerNotification = await Notification.findOne({
      recipient: auction.owner,
      sender: bidder._id,
      product: auction._id,
      type: 'auction',
      createdAt: { $gte: new Date(Date.now() - 5 * 60 * 1000) }
    });

     if (!existingSellerNotification) {
    // Create notification for the seller
    const sellerNotification = new Notification({
      recipient: auction.owner,
      sender: bidder._id,
      product: auction._id,
      title: 'Auction Ended',
      description: `Your auction for ${auction.name} has ended. The winner is ${bidder.username} with a bid of $${bid.bidAmount}.`,
      type: 'auction'
    });
    console.log('Seller notification:', sellerNotification);
    await sellerNotification.save();
    console.log('Seller notification saved:', sellerNotification);
    
    // Send notifications via Socket.IO
    if (io) {
      io.to(seller._id.toString()).emit('new_notification', {
        ...sellerNotification.toObject(),
        time: 'Just now'
      });
    }

}
  } catch (error) {
    console.error('Error creating auction notifications:', error);
  }
}