const mongoose = require('mongoose');


const connectToMongoDB = async () => {
  try {
    await mongoose.connect("mongodb://localhost:27017/miniproject", {
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
