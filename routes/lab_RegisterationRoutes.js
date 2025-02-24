const express= require('express');
const router= express.Router();

const LabRegistration = require('../models/lab_Registeration');
const PatientReferral= require('../models/patient_referral');
const authMiddleware= require('../middleware/authMiddleware');
const roleMiddleware= require('../middleware/roleMiddleware');


// Clerk Registring the patient for lab tests

router.post('/register',authMiddleware,roleMiddleware(['clerk']),async(req,res)=>{
    try{
        const { ReferralId, DoctorId, DiagnosticTest,TestDate}=req.body;

        const referral= await PatientReferral.findById(ReferralId);
        if(!referral){
            return res.status(404).json({message:'Patient Referral Not Found'});
            }

        if(referral.referredTo!=='Pathology'){
            return res.status(400).json({message:'This referral is not for Pathology Service'});
        }
        const labRegistration = new LabRegistration({
            patient_Id: referral.patientId,
            doctor_Id: DoctorId || referral.doctorId,
            labTest: DiagnosticTest,
            testDate: TestDate
        });

        await labRegistration.save();
        res.status(201).json({message:'Patient Registred for diagnostic test in Pathology', labRegistration});
    } catch(error){
          console.error(error);
        res.status(500).json({error:'Error Registring Patient for Test'});

    }


    
});

module.exports= router;
