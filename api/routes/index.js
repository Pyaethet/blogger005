const express = require("express");
const Post = require("../../models/Post");
const User = require("../../models/User");
var passwordValidator = require('password-validator');
const Comment = require("../../models/Comment");
const jwt = require("jsonwebtoken");

const router = express.Router();

var schema = new passwordValidator();

schema
.is().min(8)                                    // Minimum length 8
.is().max(100)                                  // Maximum length 100
.has().uppercase()                              // Must have uppercase letters
.has().lowercase()                              // Must have lowercase letters
.has().digits(2)                                // Must have at least 2 digits
.has().not().spaces()                           // Should not have spaces
.is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

router.get("/", async (req, res) => {
    try{
    const posts = await Post.find({}).populate("author");
    res.status(200).json({
        message: "Index Page",
        posts: posts,
    });
}catch(e){
    res.status(500).json({
        message: "Internal Server Error",
        error: e,
    });
}
});

router.post("/register",async (req, res) => {
    try{
        const user = new User();
        user.name = req.body.name;
        user.email = req.body.email;
        user.password = req.body.password;
        const data = await user.save();
        res.status(200).json({
            message: "Register Success",
            user: data,
        });
    }catch (e){
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        });
    }
});

router.post("/checkDup", async (req, res)=>{
    try{
        const user = await User.findOne({email: req.body.email});
        if(user)
        res.status(200).json({message:"Email is Duplicated", status:true});
        else res.status(200).json({message: "Email is not Duplicated", status: false});
    }catch(e){
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        });
    }
});

router.post("/checkPassword", async (req, res)=>{
    try{
        res.status(200).json({status: schema.validate(req.body.password)});   
    }catch(e){
        res.status(500).json({
            message: "Internal Server Error",
            error: e,
        });
    }
});

router.post("/login",async (req,res)=>{
    const user = await User.findOne({ email : req.body.email});
    if(user != null && User.compare(req.body.password,user.password)){
        const token = jwt.sign(
            { id: user._id,email: user.email, name:user.name},"techApi005",
            { expiresIn : "2h"}
        );
        res.status(200).json({
            message: "Account login success",
            token: token,
        });
    }else{
        res.status(401).json({
            message: "Email not found or password not match",
        });
    }
});

router.get("/postdetail/:id",async (req,res)=>{
    const post = await Post.findById(req.params.id).populate("author");
    const comments = await Comment.find({ post: post._id}).populate("commenter");
    let reactStatus;
    let favStatus;
    try{
        const token = req.headers.token;
        const decode = jwt.verify(token,"techApi005");
        reactStatus = post.like.filter(function(data){
            return data.user == decode.id;
        });
        const user= await User.findById(decode.id);
        favStatus = user.favoriteB.filter(function(data){
            return data.blogger == post.author._id.toString();
        });
        res.status(200).json({
            post,
            comments,
            reactStatus,
            favStatus,

        });
    }catch(e){
        reactStatus =[];
        favStatus = [];
        res.status(200).json({
            post,
            comments,
            reactStatus,
            favStatus, 
        });
    }
});

module.exports = router;