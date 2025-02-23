
const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
const userRoutes = require('./routes/userRoutes');
const patientRoutes = require('./routes/patientRoutes'); 
const treatmentRoutes = require('./routes/treatmentRoutes');

const app = express();

const db = config.get('mongoURI');

// Middleware
app.use(express.json());
app.use(cors());

mongoose
 .connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
 .then(() => console.log('MongoDB Connected...'))
 .catch(err => console.log(err));

// Routes
app.use('/api/auth', userRoutes);
app.use('/api/patient', patientRoutes);
app.use('/api/treatment', treatmentRoutes); 

// Sample Route
app.get('/', (req, res) => {
    res.send('Patient Information System API');
});

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
