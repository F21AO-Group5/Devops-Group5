const express = require('express');
const router = express.Router();
const auth = require('../middleware/authMiddleware');
const Patient = require('../models/patient');
const User = require('../models/Users');

// Register a new patient By clerk
router.post('/register', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || user.role !== 'clerk') {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const { name, age, knownDiseases, servicePoint } = req.body;
        const newPatient = new Patient({
            name,
            age,
            knownDiseases,
            servicePoint,
        });

        await newPatient.save();
        res.json({ msg: 'Patient registered successfully', patient: newPatient });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

// Retrieve patient details 
router.get('/:id', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user || !['doctor', 'nurse', 'admin'].includes(user.role)) {
            return res.status(403).json({ msg: 'Access denied' });
        }

        const patient = await Patient.findById(req.params.id);
        if (!patient) {
            return res.status(404).json({ msg: 'Patient not found' });
        }

        res.json({ patient });
    } catch (error) {
        res.status(500).json({ error: 'Server error' });
    }
});

module.exports = router;