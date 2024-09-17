


const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

const connectToMongoDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

connectToMongoDB();


const userSchema = new mongoose.Schema({
  username: String,
  name: String,
  age: Number,
  email: String,
  password: String,
  profilepic : {
    type: String,
    default: "pld.png"  // default profile pic if no profile pic uploaded by user
  },
  posts: [
    { type: mongoose.Schema.Types.ObjectId, ref: "post" } 
  ]
});

module.exports = mongoose.model('user', userSchema); // Export the model
