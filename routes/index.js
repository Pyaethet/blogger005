var express = require('express');
var passwordValidator = require('password-validator');
var router = express.Router();
const User = require("../models/User");
const Post = require("../models/Post");
const Comment = require("../models/Comment");
/* GET home page. */
var schema = new passwordValidator();

schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); 

router.get('/',async function(req, res, next) {
  const posts = await Post.find({}).populate("author");
  res.render("index", { posts: posts });
});

router.get("/register", function (req,res){
  res.render("register");
});

router.post("/register", async function(req, res){
  const user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  const data = await user.save();
  console.log(data);
  res.redirect("/login");
});

router.get("/login", function (req, res){
  res.render("login");
});

router.post("/login", async function(req, res){
  const user = await User.findOne({ email: req.body.email});
  console.log(user != null , User.compare(req.body.password,user.password))
  if (user != null && User.compare(req.body.password,user.password)){
    req.session.user = { id: user._id, name: user.name, email: user.email};
    res.redirect("/");
  }else{
    res.redirect("/login");
  }
});

router.post("/checkDub", async function(req, res){
  const user = await User.findOne({email: req.body.email});
  if (user) res.json({ message: "Duplicated email", status : true});
  else res.json({ message: "Not duplicated email", status : false});
});

router.get("/logout", function(req, res){
  req.session.destroy(function(){
    res.redirect("/");
  });
});
router.get("/postdetail/:id",async function(req,res){
  const post = await Post.findById(req.params.id).populate("author");
  const comments = await Comment.find({ post : post._id}).populate("commenter");

  let reactStatus;
  if(req.session.user){
    reactStatus = post.like.filter(function(data){
      return data.user == req.session.user.id;
    });
    const user = await User.findById(req.session.user.id);
    favStatus = user.favoriteB.filter(function(data){
      return data.blogger == post.author._id.toString();
    });
    res.render("postdetail",{
      post: post,
      comments: comments,
      reactStatus: reactStatus,
      favStatus: favStatus,
    });
  }else{
    reactStatus = [];
    favStatus = [];
    res.render("postdetail",{
      post: post,
      comments: comments,
      reactStatus: reactStatus,
      favStatus: favStatus,
    });
  }
});
router.post("/checkPassword",function(req,res){
  res.json({ status: schema.validate(req.body.password)});
});

module.exports = router;
