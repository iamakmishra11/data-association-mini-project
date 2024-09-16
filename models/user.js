const mongoose = require('mongoose');

mongoose.connect("mongodb://localhost:27017/miniproject");

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
