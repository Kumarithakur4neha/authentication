const  mongoose=require("mongoose")

const postSchema=new mongoose.Schema({
    title:{
        type:String,
        trim:true,
required:[true,"title is required"],
minlength:[4,"title  must be 4 character long"]
    },
    media:{
        type:String,
        required:[true,"media is required"]
    },
    user:{type:mongoose.Schema.Types.ObjectId, ref:"user"},
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "user" }],
},
{timestamps:true}
);
module.exports=mongoose.model("post",postSchema)
