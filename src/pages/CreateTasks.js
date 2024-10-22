import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig'; // Import your Firebase config
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc, onSnapshot  } from 'firebase/firestore';

function CreateTasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const navigate = useNavigate();

  // Reference to the tasks collection in Firebase
  const tasksCollectionRef = collection(db, 'tasks');

  // Fetch tasks from Firebase
  useEffect(() => {
    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe(); // Cleanup listener on component unmount
  }, []);

  // Handle adding a new task
  const handleAddTask = async () => {
    if (newTask.trim() === '') return;
    await addDoc(tasksCollectionRef, { name: newTask });
    setNewTask(''); // Clear input
    
  };

  // Handle updating an existing task
  const handleEditTask = async (id) => {
    const newName = prompt('Enter new task name:');
    if (newName) {
      const taskDoc = doc(db, 'tasks', id);
      await updateDoc(taskDoc, { name: newName });
      
    }
  };

  // Handle deleting a task
  const handleDeleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id);
    await deleteDoc(taskDoc);
  };

  // Navigate back to Dashboard
  const handleBackToDashboard = () => {
    navigate('/dashboard'); // Adjust the route if needed
  };

  return (
    <div>
      <h2>Create Tasks</h2>
      <input
        type="text"
        placeholder="Enter a new task"
        value={newTask}
        onChange={(e) => setNewTask(e.target.value)}
        style={{ marginRight: '10px' }}
      />
      <button onClick={handleAddTask}>Add Task</button>

      <div style={{ marginTop: '20px' }}>
        <h3>Tasks</h3>
        <ul>
          {tasks.map((task) => (
            <li key={task.id} style={{ marginBottom: '10px' }}>
              {task.name}
              <button
                onClick={() => handleEditTask(task.id)}
                style={{ marginLeft: '10px' }}
              >
                Edit Task
              </button>
              <button
                onClick={() => handleDeleteTask(task.id)}
                style={{ marginLeft: '5px' }}
              >
                Delete Task
              </button>
            </li>
          ))}
        </ul>
      </div>

      <button onClick={handleBackToDashboard} style={{ marginTop: '20px' }}>
        Back to Dashboard
      </button>
    </div>
  );
}

export default CreateTasks;

