const express = require('express');
const multer = require('multer');
const fs = require('fs');
const authMiddleware = require('../middleware/authMiddleware');
const roleMiddleware = require('../middleware/roleMiddleware');
const LabRegistration = require('../models/lab_Registeration');

const router = express.Router();

// Configure Multer for file uploads
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        const uploadPath = 'uploads/lab_results/';
        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }
        cb(null, uploadPath);
    },
    filename: function (req, file, cb) {
        cb(null, `${Date.now()}-${file.originalname}`);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req, file, cb) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Invalid file type. Only PDF, JPG, and PNG are allowed.'));
        }
    }
});

// Uploading Lab Test Results by nurse or paramedic
router.post('/uploadResult/:id', authMiddleware, roleMiddleware(['nurse', 'paramedics']), upload.array('files', 5), async (req, res) => {
    try {
        const { result } = req.body;
        const labTest = await LabRegistration.findById(req.params.id);
        if (!labTest) return res.status(404).json({ message: 'Lab test not found' });

        if (labTest.resultFiles.length > 0) {
            return res.status(400).json({ message: 'Results already uploaded for this test' });
        }

        const filePaths = req.files.map(file => file.path);
        labTest.resultFiles = filePaths;
        labTest.result = result;
        labTest.resultPublishedOn = new Date();
        await labTest.save();

        res.status(201).json({ message: 'Lab test results uploaded successfully', result: labTest.result, files: filePaths });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Fetch Lab Test Results (Accessible by doctor, nurse, and paramedics)
router.get('/getResults/:id', authMiddleware, roleMiddleware(['doctor', 'nurse', 'paramedics']), async (req, res) => {
    try {
        const labTest = await LabRegistration.findById(req.params.id);
        if (!labTest) return res.status(404).json({ message: 'Lab test not found' });

        res.json({ result: labTest.result, resultFiles: labTest.resultFiles });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;