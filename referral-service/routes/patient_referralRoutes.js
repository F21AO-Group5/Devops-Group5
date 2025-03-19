const express = require('express');
const router = express.Router();
const PatientReferral = require('../models/patient_referral');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');


// Doctor refering for lab tests
router.post('/refer', authMiddleware, roleMiddleware(['doctor']), async (req, res) => {
try{
    const{ patientId, referredTo, notes}= req.body;

    const newPatientReferral= new PatientReferral({
        patientId,
        doctorId: req.user.id,
        referredTo, 
        notes
    });

    await newPatientReferral.save();
    res.status(201).json({message:'patient referred to service', referral: newPatientReferral});

}catch(error){
    res.status(400).json({error:'Error referring to patient service'});
}

});

module.exports= router;

