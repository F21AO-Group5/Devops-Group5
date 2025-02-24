const mongoose = require('mongoose');

const LabRegistrationSchema = new mongoose.Schema({
    patient_Id: {
         type: mongoose.Schema.Types.ObjectId,
         ref: 'Patient',
        required: true
        
    },
    doctor_Id: { 
        
         type: mongoose.Schema.Types.ObjectId,
         ref: 'User',
        required: true
        
    },
    labTest: { 
        
         type: String,
         required: true
         
    },
    testDate: { 
        
         type: Date,
         required: true
         
    },
    result: {

         type: String,
         default: 'Pending'
         
    },
    resultPublishedOn: { 
        type: Date

    },
 });
 
 const LabRegistration = mongoose.model('LabRegistration', LabRegistrationSchema);
 module.exports = LabRegistration;
 