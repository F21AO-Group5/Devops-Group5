const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const Patient = require('../models/patient');
 
// Register a new patient By clerk
router.post('/register', authMiddleware, roleMiddleware(['clerk']), async (req, res) => {
    try {
        const { name, age, gender, contact, servicePoint } = req.body;
        const newPatient = new Patient({
            name,
            age,
            gender,
            contact,
            servicePoint,
        });
 
        await newPatient.save();
        res.json({ msg: 'Patient registered successfully', patient: newPatient });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
 
// Retrieve patient details
router.get('/:id', authMiddleware, roleMiddleware(['doctor', 'nurse', 'admin', 'paramedics']), async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ msg: 'Patient not found' });
        }
 
        res.json({ patient });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
 
// Delete patient record (Accessible by clerk only)
router.delete('/:id', authMiddleware, roleMiddleware(['clerk']), async (req, res) => {
    try {
        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ msg: 'Patient not found' });
        }
        
        await Patient.findByIdAndDelete(req.params.id);
        res.json({ msg: 'Patient record deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});
 
module.exports = router;