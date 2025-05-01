import mongoose from "mongoose";

const chatSchema = new mongoose.Schema({
  product: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Product', 
    required: true 
  },  // Links the chat to a product

  buyer: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },  // Buyer ID (ensures messages are separate per buyer)

  seller: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },  // Seller ID (who owns the product)

  messages: [
    {
      sender: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', 
        required: true 
      }, // Either the buyer or the seller
      message: { 
        type: String, 
        required: true 
      },
      timestamp: { 
        type: Date, 
        default: Date.now 
      }
    }
  ]
});

// Ensure a unique conversation per buyer, seller, and product
chatSchema.index({ product: 1, buyer: 1, seller: 1 }, { unique: true });

const Chat = mongoose.model("Chat", chatSchema);

export default Chat;
