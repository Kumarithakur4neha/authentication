const mongoose=require("mongoose")

mongoose.connect("mongodb://127.0.0.1:27017/socialmedia").then(()=> console.log("db is established") )  