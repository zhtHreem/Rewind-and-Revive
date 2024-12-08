
import express from 'express'
import dotenv from 'dotenv';
import connectDB from './src/config/db.js';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import FormData from 'form-data';
import userRoute from './src/routes/user.js'
import productRoute from './src/routes/product.js'
import bidRoute from './src/routes/biddingProduct.js'


const app = express();
const port = process.env.PORT || 5000;

connectDB();
app.use(cors());

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

//Static folder for uploaded files
app.use('/upload',express.static((path.join(__dirname,'src','database', 'models', 'upload') )));
//console.log("Static file serving at:", path.join(__dirname, 'src', 'database', 'models', 'upload'));

app.use('/api/user',userRoute)
app.use('/api/product',productRoute)
app.use('/api/biddingProduct', bidRoute)


//app.use('/api', ProductRoutes);
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});


app.get('/', (req, res) => res.send('Hello World!'));


app.listen(port, () => console.log(`Server running on port ${port}`));


