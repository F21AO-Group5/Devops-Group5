const express = require('express');
const mongoose = require('mongoose');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Patient = require('../models/patient');

const router = express.Router();

//Patient treatment module by adding and fetching for respective roles

// adding treatment record which are accesible by doctors and nurse only
router.post('/:id/treatment', authMiddleware, roleMiddleware(['doctor','paramedics']), async (req, res) => {
  try {
    const { diagnosis, prescription, referral } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const treatmentRecord = { _id: new mongoose.Types.ObjectId(), diagnosis, prescription, referral, date: new Date() };
    patient.treatmentHistory = patient.treatmentHistory || [];
    patient.treatmentHistory.push(treatmentRecord);
    await patient.save();

    res.status(201).json({ message: 'Treatment record added successfully', treatmentRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Existing treatment record can be updated by either doctors or nurses only.
router.put('/:treatmentId', authMiddleware, roleMiddleware(['doctor','paramedics']), async (req, res) => {
  try {
    const { diagnosis, prescription, referral } = req.body;
    const patient = await Patient.findOne({ 'treatmentHistory._id': req.params.treatmentId });
    if (!patient) return res.status(404).json({ message: 'Treatment record not found' });
    
    const treatmentIndex = patient.treatmentHistory.findIndex(t => t._id.toString() === req.params.treatmentId);
    
    patient.treatmentHistory[treatmentIndex] = {
      ...patient.treatmentHistory[treatmentIndex],
      diagnosis,
      prescription,
      referral,
      date: new Date()
    };
 
    await patient.save();
 
    res.status(200).json({ message: 'Treatment record updated successfully', updatedTreatment: patient.treatmentHistory[treatmentIndex] });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



module.exports = router;