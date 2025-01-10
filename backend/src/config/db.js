
import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();
const connectDB = async ()=>{
 try{                                        
    const mongoURI=process.env.MONGO_URI ;
    console.log('Deployed MONGO_URI:', process.env.MONGO_URI);
    console.log('MONGO_URI:',mongoURI);


    await mongoose.connect(mongoURI);
    console.log('MongoDB connected...', mongoURI);
} catch (error) {
     console.error('Error connecting to MongoDB:', error.message);
     process.exit(1); 
}
};
export default connectDB; 


