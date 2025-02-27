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
    resultFiles: [{ type: String }],
    result: {
 
         type: String,
         default: 'Pending'
         
    },
    resultPublishedOn: {
        type: Date
    },
    updatedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'User'
     }
});
 
const LabRegistration = mongoose.model('LabRegistration', LabRegistrationSchema);
module.exports = LabRegistration;