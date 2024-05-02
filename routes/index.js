var express = require('express');
var router = express.Router();
const user=require("../models/userschema")

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

router.get("/login" ,function(req,res,next){
  res.render("login")
})

router.get("/about",function(req,res,next){
  res.render("about")
})

router.get("/register",function(req,res,next){
  res.render("register")
})

router.post("/register-user", async function(req,res,next){

   const newuser= new user(req.body)
 await newuser.save()
  res.redirect("/login")
})

module.exports = router;
