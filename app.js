const express = require("express");
const app = express();
const userModel = require("./models/user"); // Adjust the path as needed
const postModel = require("./models/post");
const cookieParser = require("cookie-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const path = require("path");
const upload = require("./config/multerconfig");
const mongoose = require('mongoose');
require('dotenv').config(); // Load environment variables from .env file

// Connect to MongoDB
const connectToMongoDB = async () => {
  try {
    await mongoose.connect('mongodb+srv://anujmishra26062002:akmishra@cluster0.yrxpx.mongodb.net/');
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB:', error.message);
  }
};

connectToMongoDB();

// Set up view engine (EJS)
app.set("view engine", "ejs");

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.render("index"); // Assuming you have an "index.ejs" file
});

app.get("/profile/uploads", (req, res) => {
  res.render("profileupload"); // Assuming you have an "index.ejs" file
});

app.post("/upload", isLoggedIn, upload.single("image"), async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email });
    user.profilepic = req.file.filename;
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Error uploading image:", error.message);
    res.status(500).send("Internal server error");
  }
});

// Login Route
app.get("/login", (req, res) => {
  res.render("login"); // Assuming you have an "login.ejs" file
});

app.post("/post", isLoggedIn, async (req, res) => {
  try {
    const user = await userModel.findOne({ email: req.user.email });
    const { content } = req.body;

    // Join paragraphs with newline characters
    const contentArray = Array.isArray(content) ? content : [content];
    const formattedContent = contentArray.join('\n');

    const newPost = await postModel.create({
      user: user._id,
      content: formattedContent,
    });

    user.posts.push(newPost._id);
    await user.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Error creating post:", error.message);
    res.status(500).send("Internal server error");
  }
});

app.get("/profile", isLoggedIn, async (req, res) => {
  try {
    let user = await userModel.findOne({ email: req.user.email }).populate('posts');
    res.render("profile", { user });
  } catch (error) {
    console.error("Error fetching profile:", error.message);
    res.status(500).send("Internal server error");
  }
});

// For managing the like and unlike buttons
app.get("/like/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user');

    if (post.likes.indexOf(req.user.userid) === -1) {
      post.likes.push(req.user.userid);
    } else {
      post.likes.splice(post.likes.indexOf(req.user.userid), 1);
    }

    await post.save();
    res.redirect("/profile");
  } catch (error) {
    console.error("Error liking post:", error.message);
    res.status(500).send("Internal server error");
  }
});

// For managing the edit button click
app.get("/edit/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOne({ _id: req.params.id }).populate('user');
    res.render("edit", { post });
  } catch (error) {
    console.error("Error fetching post for edit:", error.message);
    res.status(500).send("Internal server error");
  }
});

// Update your post
app.post("/update/:id", isLoggedIn, async (req, res) => {
  try {
    let post = await postModel.findOneAndUpdate({ _id: req.params.id }, { content: req.body.content });
    res.redirect("/profile");
  } catch (error) {
    console.error("Error updating post:", error.message);
    res.status(500).send("Internal server error");
  }
});

// Register Route
app.post("/register", async (req, res) => {
  const { email, password, username, name, age } = req.body;

  try {
    let user = await userModel.findOne({ email });
    if (user) {
      return res.status(400).send({ error: "Email already exists" });
    }

    
    const hash = await bcrypt.hash(password, 10);

    user = await userModel.create({
      username,
      name,
      age,
      email,
      password: hash,
    });

    // Redirect to login page after successful registration
    res.redirect("/login");
  } catch (error) {
    console.error("Error during registration:", error.message);
    res.status(500).send("Internal server error");
  }
});

// Login Route Define
app.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    let user = await userModel.findOne({ email });
    if (!user) {
      return res.status(400).send({ error: "User not exist" });
    }
    bcrypt.compare(password, user.password, function (err, result) {
      if (result) {
        const token = jwt.sign({ email: email, userid: user._id }, "aalu");
        res.cookie("token", token);
        res.status(200).redirect("/profile");
      } else res.redirect("/login");
    });
  } catch (error) {
    console.error("We have an Error during Login:", error.message);
    res.status(500).send("Internal server error");
  }
});

// Logout route
app.get("/logout", function (req, res) {
  res.clearCookie("token");
  res.redirect("/login"); // Redirect to home page after logout
});

function isLoggedIn(req, res, next) {
  const token = req.cookies.token;

  if (!token) {
    // Redirect to login page if token is missing
    return res.redirect("/login");
  }

  try {
    const data = jwt.verify(token, "aalu");
    req.user = data;
    next();
  } catch (error) {
    console.error("Error verifying token:", error.message);
    res.status(401).send("Unauthorized"); // You can customize the error response
  }
}

// Start the server
const PORT = process.env.PORT || 3011;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
