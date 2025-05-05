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
    }
  });
  console.log('Ended auctions:', endedAuctions);
  
  for (const auction of endedAuctions) {
    // Process winners based on bidding model
    if (auction.biddingModel === "Highest Bidder") {
      await processHighestBidder(auction, io);
    } else if (auction.biddingModel === "Top 3 Bidders") {
      await processTopBidders(auction, io, 3);
    }
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
  // Get top N bids - removed the populate since 'name' is just a string
  const topBids = await Bid.find({ productId: auction._id })
    .sort({ bidAmount: -1 })
    .limit(count);
  
  for (let i = 0; i < topBids.length; i++) {
    const position = i + 1;
    const message = `Congratulations! You are #${position} in the auction for ${auction.name}`;
    await notifyWinner(auction, topBids[i], io, message);
  }
}

async function notifyWinner(auction, bid, io, message) {
  try {
    // Get user info - using bidderId instead of name
    const bidder = await User.findById(bid.bidderId);
    console.log('Bidder:', bidder);
    // const seller = await User.findById(auction.owner);
    
    // if (!bidder || !seller) {
    //   console.log(`Bidder (${bid.bidderId}) or seller (${auction.owner}) not found`);
    //   return;
    // }
    
    // Create notification for the winner
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
    
    // // Create notification for the seller
    // const sellerNotification = new Notification({
    //   recipient: auction.owner,
    //   sender: bidder._id,
    //   product: auction._id,
    //   title: 'Auction Ended',
    //   description: `Your auction for ${auction.name} has ended. The winner is ${bidder.username} with a bid of $${bid.bidAmount}.`,
    //   type: 'auction'
    // });
    // await sellerNotification.save();
    
    // Send notifications via Socket.IO
    if (io) {
      // To winner
      io.to(bidder._id.toString()).emit('new_notification', {
        ...winnerNotification.toObject(),
        time: 'Just now'
      });
      
    //   // To seller
    //   io.to(seller._id.toString()).emit('new_notification', {
    //     ...sellerNotification.toObject(),
    //     time: 'Just now'
    //   });
    }
  } catch (error) {
    console.error('Error creating auction notifications:', error);
  }
}