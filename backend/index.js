import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import AWS from 'aws-sdk';  // Import AWS SDK for Bedrock
dotenv.config();  // This loads variables from the .env file


// Initialize AWS Bedrock client
// const bedrock = new AWS.Bedrock({
//   accessKeyId: import.meta.env.AWS_ACCESS_KEY_ID,
//   secretAccessKey: import.meta.env.AWS_SECRET_ACCESS_KEY,
//   region: import.meta.env.AWS_REGION
// });

const app = express();
app.use(cors());
app.use(express.json());

const mongoKey = import.meta.env.VITE_MONGO_URI;
// MongoDB connection
mongoose.connect(mongoKey)
  .then(() => console.log('Connected to MongoDB'))
  .catch((error) => console.error('MongoDB connection error:', error));

// Task model
import Task from './models/Task.js';

// Get all tasks
app.get('/tasks', async (req, res) => {
  try {
    const tasks = await Task.find();
    res.json(tasks);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tasks' });
  }
});

// Create a new task
app.post('/tasks', async (req, res) => {
  const { title, time, location, frequency } = req.body;

  try {
    const newTask = new Task({ title, time, location, frequency });
    await newTask.save();
    res.json(newTask);
  } catch (error) {
    res.status(500).json({ message: 'Error creating task' });
  }
});

// Delete a task
app.delete('/tasks/:id', async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) return res.status(404).json({ message: 'Task not found' });
    res.json({ message: 'Task deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting task' });
  }
});

// Analyze tasks using Bedrock
// app.post('/analyze-tasks', async (req, res) => {
//   const { tasks } = req.body;
//
//   const prompt = `
//     Analyze the following tasks and provide insights about the user's time management,
//     over-scheduling, and possible improvements: ${JSON.stringify(tasks)}
//   `;
//
//   const params = {
//     modelId: 'your-bedrock-model-id',  // Replace with your specific Bedrock model ID
//     inputText: prompt,                // Input prompt for analysis
//   };
//
//   try {
//     const response = await bedrock.invokeModel(params).promise();
//     res.json({ insights: response });  // Return the insights to the client
//   } catch (error) {
//     console.error('Error analyzing tasks with Bedrock:', error);
//     res.status(500).json({ message: 'Error analyzing tasks' });
//   }
// });

// Start the server
app.listen(27017, () => {
  console.log(`Server running on port 27017`);
});



