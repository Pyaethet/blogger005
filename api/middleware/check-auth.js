const jwt = require("jsonwebtoken");
 module.exports = function(req,res,next){
    try{
        const token = req.headers.token;
        const decode = jwt.verify(token,"techApi005");
        console.log(decode);
        next();
    }catch(e){
        res.status(401).json({
            message: "Auth fail",
        });
    }
 };