const express = require('express');
const bcrypt = require('bcryptjs');
const config = require('config');
const jwt = require('jsonwebtoken');
const User = require('../models/Users');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// User Registration
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    if (!['admin', 'doctor', 'nurse', 'clerk'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({ name, email, password: hashedPassword, role });
    await newUser.save();
    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// User Login
router.post('/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      const user = await User.findOne({ email });
      if (!user) return res.status(400).json({ message: 'Invalid email or password' });
      
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch) return res.status(400).json({ message: 'Invalid email or password' });
      
      const token = jwt.sign({ id: user._id, role: user.role }, config.get('JWT_SECRET'), { expiresIn: '1h' });
      res.json({ token, role: user.role, userId: user._id });
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });
  
// Protected Route - Fetch User Profile
router.get('/profile', authMiddleware, async (req, res) => {
    try {
      const user = await User.findById(req.user.id).select('-password');
      res.json(user);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  });

module.exports = router;
