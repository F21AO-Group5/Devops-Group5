const express = require('express');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Patient = require('../models/patient');

const router = express.Router();

//Patient treatment module by adding and fetching for respective roles

// adding treatment record which are accesible by doctors and nurse only
router.post('/:id/treatment', authMiddleware, roleMiddleware(['doctor','nurse']), async (req, res) => {
  try {
    const { diagnosis, prescription, referral } = req.body;
    const patient = await Patient.findById(req.params.id);
    if (!patient) return res.status(404).json({ message: 'Patient not found' });
    
    const treatmentRecord = { diagnosis, prescription, referral, date: new Date() };
    patient.treatmentHistory = patient.treatmentHistory || [];
    patient.treatmentHistory.push(treatmentRecord);
    await patient.save();

    res.status(201).json({ message: 'Treatment record added successfully', treatmentRecord });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// treatment record can be fetched by doctor or admin or paramedics 
router.get('/:id/treatment', authMiddleware, roleMiddleware(['doctor', 'admin','paramedics']), async (req, res) => {
    try {
      const patient = await Patient.findById(req.params.id).select('treatmentHistory');
      if (!patient) return res.status(404).json({ message: 'Patient not found' });
      res.json(patient.treatmentHistory);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;