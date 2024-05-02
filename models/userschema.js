const mongoose=require("mongoose")

 const  userschema= new mongoose.Schema({
    name:{
        type:String,
        trim:true,
        reqired:[true,"name is required"],
        minLength:[4,"name must be atleast 4 characters long"],
    },
    email:{
    type:String,
        trim:true,
        unique:true,
        lowercase:true,
        reqired:[true,"name is required"],
       match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please fill a valid email address'],
    },
    password:String,
},
{ timestamps:true }
);
  const user=mongoose.model("user",userschema);
  module.exports=user;



