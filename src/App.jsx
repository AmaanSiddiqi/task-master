import { useState } from 'react'
import { useEffect } from 'react'
import './App.css'
import { Button, Input } from '@chakra-ui/react'
import MapComponent from './MapComponent';
import dotenv from "dotenv";

const perplexityApiKey = import.meta.env.VITE_PERPLEXITY_API_KEY;
const mapboxAccessToken = import.meta.env.VITE_MAPBOX_ACCESS_TOKEN;

function App() {
  const [tasks, setTasks] = useState([]);

  // Fetch tasks when the component mounts
  useEffect(() => {
    fetchTasks();
  }, []);

  const fetchTasks = async () => {
    try {
      // Using fetch to get tasks from the backend
      const response = await fetch('http://localhost:5001/tasks');
      const data = await response.json();
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      let extractedData = "";
      // Using fetch to create a new task
      let inputText = document.getElementById('taskInputValue').value;
      document.getElementById('taskInputValue').value = "";
      const options = {
        method: 'POST',
        headers: {Authorization: `Bearer ${perplexityApiKey}`, 'Content-Type': 'application/json'},
        body: '{"model":"llama-3.1-sonar-small-128k-chat","messages":[{"role":"system","content":"Extract the following fields from the provided string, which details a user\'s to-do task: summary of task, date/time, location, frequency, and urgency. The summary field is required, while the others are optional and may be absent. Return the extracted values as JSON, with missing fields set to null. OUTPUT ONLY THE MAP."},{"role":"user","content":"' + inputText + '"}],"temperature":0.2,"top_p":0.9,"return_citations":true,"search_domain_filter":["perplexity.ai"],"return_images":false,"return_related_questions":false,"search_recency_filter":"month","top_k":0,"stream":false,"presence_penalty":0,"frequency_penalty":1}'
      };
      const test = await fetch('https://api.perplexity.ai/chat/completions', options)
      extractedData = await test.json();
      let test2 = extractedData.choices[0].message.content;
      test2 = test2.slice(10, -6);
      const brokenLines = test2.split('\n');
      let store = []
      for (let line of brokenLines) {
        let temp = line.split("\":")[1].trim()
        let temp2 = temp.trim().charAt(temp.length - 1);
        if (temp2 === ",") {
          store.push(temp.slice(0, -1));
        } else {
          store.push(temp);
        }
      }

      let latlng = [0,0]
      let latlngmap = {lat:0,lng:0};

      if ((store[2] !== null) && (store[2] !== "null")) {
        latlng = await fetch('https://api.mapbox.com/search/geocode/v6/forward?q=' + store[2] + `&access_token=${mapboxAccessToken}`);
        const latlng2 = await latlng.json();
        latlngmap = {lng: latlng2.features[0].properties.coordinates.longitude, lat: latlng2.features[0].properties.coordinates.latitude};
      }

      const newTask = {
        title: store[0],
        time: store[1],
        location: latlngmap,
        frequency: store[3],
        urgency: store[4]
      }
      const response = await fetch('http://localhost:5001/tasks', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newTask)
      });
      const createdTask = await response.json();
      setTasks([...tasks, createdTask]);
    } catch (error) {
      console.error('Error creating task:', error);
    }
  };

  const handleDeleteTask = async (id) => {
    try {
      await fetch(`http://localhost:5001/tasks/${id}`, { method: 'DELETE' });
      setTasks(tasks.filter((task) => task._id !== id));
    } catch (error) {
      console.error('Error deleting task:', error);
    }
  };

  return (
    <div className="grid-container">
      {/* Input Field */}
      <div className="task-input">
        {/* Change below later -- should fill in more than the title w/ perplexity */}
        <Input id="taskInputValue" variant='flushed' placeholder='Add your task!' />
        <Button onClick={handleCreateTask} colorScheme='teal' variant='outline'>
        Submit </Button>

      </div>
      
      {/* Map View */}
      <div className="map-view">
        {/* Map component or view */}
        <MapComponent tasks={tasks} />
      </div>

      <div className="task-list-header"><p>Current Tasks</p></div>

      <ul className="task-list">
        {tasks.map((task) => (
          <li key={task._id} className="task">
            {task.title} 
            {task.time ? " - " : ""}
            {task.time} 
            {task.location ? (task.location.lat ? " - " : "") : ""}
            {task.location ? task.location.lat : ""}
            {task.location ? (task.location.lng ? "," : "") : ""}
            {task.location ? task.location.lng : ""}
            {task.frequency ? " - " : ""}
            {task.frequency}
            {task.urgency ? " - " : ""}
            {task.urgency}
            <button className="delete-button" 
              onClick={() => handleDeleteTask(task._id)}>Delete</button>
          </li>
        ))}
      </ul>

    </div>
  );
}

export default App;

