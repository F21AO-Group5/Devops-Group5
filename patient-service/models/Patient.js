const mongoose= require('mongoose')
const Schema= mongoose.Schema;

const patientSchema = new Schema({
    name: {
        type: String,
        required:true
    },

    age: {
        type:Number,
        required:true
    },

    gender: { 
        type: String, 
        required: true, 
        enum: ['male', 'female', 'other']
    },
    
    contact: {
        type: String,
        required: true 
    },

    treatmentHistory: [{       
        diagnosis: String,
        prescription: String,
        referral: String,
        date: { type: Date, default: Date.now }
    }],
     
    servicePoint:{
        type:String,  //OPD or A&E 
        required:true
    },
    CreatedAt:{
        type:Date,
        default:Date.now
    }
});

const Patient = mongoose.model('Patient',patientSchema);

module.exports = Patient;