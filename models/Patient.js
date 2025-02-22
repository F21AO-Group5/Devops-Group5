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

    knownDiseases:{
        type:[String],  //Diseases
        default:[]
    },
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