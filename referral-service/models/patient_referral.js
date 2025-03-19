const mongoose = require('mongoose');


const PatientReferralSchema = new mongoose.Schema({
    patientId: {
         type : mongoose.Schema.Types.ObjectId,
         ref :'Patient', required: true
        },
    doctorId: {
         type : mongoose.Schema.Types.ObjectId,
         ref :'User', required: true
        },
    referredTo:{
         type: String, 
         enum:['Radiology',
            'Pathology',
            'Blood Bank',
            'Physiotherapy',
            'Operation Theatre',
            'ICU',
            'CCU',
            'Ward'],
            required:true 
        },
    referralDate: {
         type: Date,
          default: Date.now 
        },
    notes:{
        type: String
    },

});

const PatientReferral = mongoose.model('PatientReferral', PatientReferralSchema);
module.exports= PatientReferral;



