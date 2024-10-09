const mongoose=require('mongoose');

const ownerSchema=new mongoose.Schema({
    fullName:{
        type:String,
        // required:true
    
    },
    country:{
        type:String,
        // required:true
    },
    state:{
        type:String,
        // required:true
    },
    city:{
        type:String,
        // required:true
    },
    address:{
        type:String,
        // required:true
    },
    verification: {
        email: {
            address: {
                type: String,
            },
            otp: {
                type: String,
            },
            otpExpiresAt: {
                type: Date,
            },
            isVerified:{
                type:Boolean,
                default:false
            }
        },
        phone: {
            number: {
                type: String,
            },
           
            isVerified:{
                type:Boolean,
                default:false
            }
        }
    },
profilePicture: {
        type: String,
        // required: true
    }
},{timestamps:true})

module.exports=mongoose.model('owner',ownerSchema);


