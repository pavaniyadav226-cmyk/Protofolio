const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json());
app.use(cors());

// Database Connection Configuration
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio_db';

mongoose.connect(MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('Database connected successfully (MongoDB integration active)');
}).catch(err => {
    console.error('Database connection error:', err);
});

// Project Schema & Model for Database Storage
const projectSchema = new mongoose.Schema({
    title: String,
    description: String,
    techStack: [String]
});
const Project = mongoose.model('Project', projectSchema);

// RESTful API Endpoint to Fetch Projects
app.get('/api/projects', async (req, res) => {
    try {
        const projects = await Project.find();
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve project data from database' });
    }
});

// Added: Optional POST endpoint to easily seed initial projects
app.post('/api/projects', async (req, res) => {
    try {
        const newProject = new Project(req.body);
        const savedProject = await newProject.save();
        res.status(201).json(savedProject);
    } catch (error) {
        res.status(500).json({ error: 'Failed to save project' });
    }
});

app.listen(PORT, () => {
    console.log(`Backend server running on port ${PORT}`);
});
