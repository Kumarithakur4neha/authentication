var express = require('express');
var router = express.Router();

const upload = require("../utils/multer")
const fs = require("fs");
const path = require("path");


const user=require("../models/userschema");
const post=require("../models/postSchema")

const sendmail = require("../utils/mail");


 const passport=require("passport")   
 const LocalStrategy=require("passport-local")
 passport.use(new LocalStrategy(user.authenticate()));


/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index',{user:req.user} );
});

router.get("/login" ,function(req,res,next){
  res.render("login",{user:req.user})
})

router.get("/about",function(req,res,next){
  res.render("about", {user:req.user})
})   

router.get("/register",function(req,res,next){
  res.render("register",{user:req.user})
})

router.post("/register-user", async function(req,res,next){
try {
  const {name ,username, email , password } = req.body;
  await user.register({name  ,username, email} , password);
  res.redirect('/login');
 } catch (error) {
  res.send(error)
 }

});



router.post("/login-user", passport.authenticate("local",{
  successRedirect:"/profile",
failureRedirect: "/login", 
}),
function(req,res,next){}

);


router.get("/timeline", isLoggedIn, async function (req, res, next) {
  try {
      res.render("timeline", { user: await req.user.populate("posts") });
  } catch (error) {
      res.send(error);
  }
});


router.get("/delete-post/:id", isLoggedIn, async function (req, res, next) {
  try {
      const deletepost = await post.findByIdAndDelete(req.params.id);

      fs.unlinkSync(
          path.join(__dirname, "..", "public", "images", deletepost.media)
      );
      res.redirect("/timeline");
  } catch (error) {
      res.send(error);
  }
});


router.get("/update-post/:pid", isLoggedIn, async function (req, res, next) {
  try {
      const newpost = await post.findById(req.params.pid);
      res.render("postupdate", { user: req.user, newpost });
  } catch (error) {
      res.send(error);
  }
});

// POST route to handle the update form submission
router.post("/update-post/:pid", isLoggedIn, async function (req, res, next) {
  try {
      await post.findByIdAndUpdate(req.params.pid, req.body);
      res.redirect(`/update-post/${req.params.pid}`);
  } catch (error) {
      res.send(error);
  }
});


router.get("/profile", isLoggedIn, async function (req, res, next) {
  try {
      const posts = await post.find().populate("user");
      res.render("profile", { user: req.user, posts });
  } catch (error) {
      res.send(error);
  }
});



router.get("/like/:postid", isLoggedIn, async function (req, res, next) {
  try {
      const Post = await post.findById(req.params.postid);
      if (Post.likes.includes(req.user._id)) {
          Post.likes = Post.likes.filter((uid) => uid != req.user.id);
      } else {
          Post.likes.push(req.user._id);
      }
      await Post.save();
      res.redirect("/profile");
  } catch (error) {
      res.send(error);
  }
});

router.get("/delete/:postid",isLoggedIn,async function(req,res,next){
  try{
const postid=req.params.postid
await post.findByIdAndDelete(postid)
res.redirect("/profile")
  }
  catch(err){
    res.send(err)
  }

})


router.get("/logout-user",function(req,res,next){
  req.logout(() =>{
    res.redirect("/login")
  })
})

function isLoggedIn(req,res,next){ 
  if(req.isAuthenticated()){
    next();

  }
  else{
    res.redirect("/login")
  }
}


router.get("/update-user/:_id", function(req,res,next){
  res.render("updateuser",{user:req.user})
});

router.post('/update-user/:_id',async function(req, res, next) {
  const id = req.params.id
   await post.findOneAndUpdate({_id : id},{
    name : req.body.name,
    username: req.body.username,
  })
  res.redirect(`/update-user/${req.user_id}`)
});


router.get("/reset-password/:_id", isLoggedIn,function(req,res,next){
  res.render("usersetpassword",{user:req.user});
})


router.post("/reset-password/:_id",isLoggedIn,async function(req,res,next){
  try{
    await req.user.changePassword(
      req.body.oldpassword,req.body.newpassword
    );
    req.user.save();
    res.redirect(`/update-user/${req.user._id}`);
  }catch(error){
    res.send(error)
  }
})



router.get("/forget-email", function(req,res,next){
  res.render("userforgetemail",{user:req.user});
})


router.post("/forget-email", async function (req, res, next) {
  try {
      const User = await user.findOne({ email: req.body.email });

      if (User) {
        sendmail(res, req.body.email ,  User);
          // res.redirect(`/forget-password/${User._id}`);
      } else {
          res.redirect("/forget-email");
      }
  } catch (error) {
      res.send(error);
  }
});
  


router.get("/forget-password/:id", function (req, res, next) {
  // console.log("sdfghjk")
  res.render("usgerforgetpassword", { user: req.user, id : req.params.id });
});

router.post("/forget-password/:id", async function (req, res, next) {
  try {
      const User = await user.findById(req.params.id);
      if (User.resetPasswordToken == 1) {
        await User.setPassword(req.body.password);
        User.resetPasswordToken = 0;
      await User.save();
    } else {
      res.send("Link Expired Try Again!");
  }
      res.redirect("/login");
  } catch (error) {   
      res.send(error);
  }
});      


router.post(
  "/image/:id",
  isLoggedIn,
  upload.single("profilepic"),
  async function (req, res, next) {
      try {
          if (req.user.profilepic !== "default.png") {
              fs.unlinkSync(
                  path.join(
                      __dirname,
                      "..",
                      "public",
                      "images",
                      req.user.profilepic
                  )
              );
          }
          req.user.profilepic = req.file.filename;
          await req.user.save();
          res.redirect(`/update-user/${req.params.id}`);
      } catch (error) {
          res.send(err);
      }
  }
);



router.get("/delete-user/:id", isLoggedIn, async function (req, res, next) {
  try {
    const deletedeuser=await user.findByIdAndDelete(req.params.id)
      if (deletedeuser.profilepic !== "default.png") {
          fs.unlinkSync(
              path.join( __dirname,
                "..",
                "public",
                "images",
                deletedeuser.profilepic
            )
                 
          );
      }
      res.redirect("/login");
  } catch (error) {
      res.send(err);
  }
});


router.get("/post-create/", isLoggedIn,function(req,res,next){
  res.render("postcreate",{user:req.user})
})

router.post("/post-create/", isLoggedIn,upload.single("media"), async function(req,res,next){
  try{
    const newpost=new post({
      title:req.body.title,
      media:req.file.filename,
      user:req.user._id,
    })
req.user.posts.push(newpost._id)
await newpost.save();
await req.user.save()
res.redirect("/profile")

  }
  catch(err){
    res.send(err)
  }
})

module.exports = router;
