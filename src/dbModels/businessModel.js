const mongoose = require('mongoose');

const businessSchema = new mongoose.Schema({
    businessName: {
        type: String,
        // required: true
    },
    country: {
        type: String,
        // required: true
    },
    state: {
        type: String,
        // required: true
    },
    city: {
        type: String,
        // required: true
    },
    address: {
        type: String,
        // required: true
    },
    openingTime: {
        type: String,
        // required: true
    },
    closingTime: {
        type: String,
        // required: true
    },
    verification: {
        email: {
            address: {
                type: String
            },
            otp: {
                type: String
            },
            otpExpiresAt: {
                type: String
            },
            isVerified:{
                type:Boolean,
                default:false
            },
        },
        phone: {
            number: {
                type: String
            },
            isVerified:{
                type:Boolean,
                default:false
            },
        },
    },
    
   uploadImage: {
        type: String,
        // required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Business', businessSchema);
