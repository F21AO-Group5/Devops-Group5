const express = require('express');
const mongoose = require('mongoose');
const config = require('config');
const cors = require('cors');
 
const labRegistrationRoutes=require('./routes/lab_RegisterationRoutes');
const labResultsRoutes = require('./routes/lab_resultsRoute');
 
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
app.use('/api/labregistration',labRegistrationRoutes);
app.use('/api/lab',labResultsRoutes);
 
// Sample Route
app.get('/', (req, res) => {
    res.send('Patient Information System API');
});
 
// Start Server
const PORT = process.env.PORT || 3004;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));