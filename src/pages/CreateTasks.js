import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { db } from '../firebaseConfig';
import { collection, addDoc, updateDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import './cssfiles/CreateTasks.css'; 

function CreateTasks() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState('');
  const [priority, setPriority] = useState('low');
  const [category, setCategory] = useState('work'); 
  const [dueDate, setDueDate] = useState('');
  const [filterCategory, setFilterCategory] = useState('all'); // State to store selected category for filtering
  const navigate = useNavigate();

  // Real-time listener for tasks from Firebase
  useEffect(() => {
    const tasksCollectionRef = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksCollectionRef, (snapshot) => {
      setTasks(snapshot.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
    });
    return () => unsubscribe(); // Clean up on unmount
  }, []);

  const handleAddTask = async () => {
    if (newTask.trim() === '') return;
    const tasksCollectionRef = collection(db, 'tasks');
    await addDoc(tasksCollectionRef, { name: newTask, priority, category, dueDate  });
    setNewTask(''); // Clear input after adding
    setPriority('low'); 
    setCategory('work');
    setDueDate('');
  };

  const handleEditTask = async (id) => {
    const task = tasks.find((task) => task.id === id);
    const newName = prompt('Enter new task name:', task?.name || '');
    const newPriority = prompt('Enter new priority (high, medium, low):', task?.priority || 'low');
    const newCategory = prompt('Enter new category (work, personal):', task?.category || 'work'); // Edit category
    const newDueDate = prompt('Enter new due date (YYYY-MM-DD):', task?.dueDate || '');
    if (
      newName &&
      (newPriority === 'high' || newPriority === 'medium' || newPriority === 'low') &&
      (newCategory === 'work' || newCategory === 'personal') &&
      newDueDate
    ) {
      const taskDoc = doc(db, 'tasks', id);
      await updateDoc(taskDoc, { name: newName, priority: newPriority, category: newCategory, dueDate: newDueDate });
    }
  };

  const handleDeleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id);
    await deleteDoc(taskDoc);
  };

  const handleCompleteTask = async (id) => {
    const taskDoc = doc(db, 'tasks', id);
    await updateDoc(taskDoc, { isComplete: true });
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Filter tasks based on selected category
  const filteredTasks = filterCategory === 'all' ? tasks : tasks.filter(task => task.category === filterCategory);

  return (
    <div className="create-tasks-container">
      <h2 className="title">Task Manager</h2>

      <div className="filter-group">
        <label>Filter by Category: </label>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value)}
          className="filter-select"
        >
          <option value="all">All</option>
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          {/* Add more categories as needed */}
        </select>
      </div>

      <div className="input-group">
        <input
          type="text"
          placeholder="Enter a new task"
          value={newTask}
          onChange={(e) => setNewTask(e.target.value)}
          className="task-input"
        />

        <select
          value={priority}
          onChange={(e) => setPriority(e.target.value)}
          className="priority-select"
        >
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
        </select>

        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="category-select"
        >
          <option value="work">Work</option>
          <option value="personal">Personal</option>
          {/* Add more categories as needed */}
        </select>

        <input
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
          className="due-date-input"
        />
        <button onClick={handleAddTask} className="add-task-btn">Add Task</button>
      </div>

      <div className="tasks-list">
        <h3 className="sub-title">Your Tasks </h3>
        {filteredTasks.length > 0 ? (
          <ul>
            {filteredTasks.map((task) => (
              <li key={task.id} className={`task-item ${task.priority}`}>
                <span className="task-name">{task.name}</span>
                <span className="task-due-date">Due: {task.dueDate || 'N/A'}</span> 
                <span className="task-status">{task.isComplete ? 'Completed' : 'Pending'}</span>
                <div className="task-buttons">
                  {!task.isComplete && (
                    <button onClick={() => handleCompleteTask(task.id)} className="complete-btn">Complete</button>
                  )}
                  <button onClick={() => handleEditTask(task.id)} className="edit-btn">Edit</button>
                  <button onClick={() => handleDeleteTask(task.id)} className="delete-btn">Delete</button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="no-tasks">No tasks available.</p>
        )}
      </div>

      <button onClick={handleBackToDashboard} className="back-btn">
        Back to Dashboard
      </button>
    </div>
  );
}

export default CreateTasks;
