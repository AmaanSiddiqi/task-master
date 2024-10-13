import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  time: String,
  location: {
    lat: Number,
    lng: Number,
  },
  frequency: String,
  urgency: { type: String, enum: ['low', 'medium', 'high']}
});

const Task = mongoose.model('Task', taskSchema);
export default Task;
