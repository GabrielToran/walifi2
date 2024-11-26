import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Calendar from 'react-calendar';
import 'react-calendar/dist/Calendar.css'; // Import default calendar styles
import '../pages/cssfiles/CustomCalendar.css'; // Import your custom styles
import WalifiLogo from '../Walifilogo.jpg'; // Adjust path if needed
import './cssfiles/Dashboard.css'; 
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; 
import { collection, getDocs, deleteDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore'; 

const Dashboard = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [overdueTasks, setOverdueTasks] = useState([]);
  const [meals, setMeals] = useState([]);
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userName, setUserName] = useState('');
  const [schedules, setSchedules] = useState([]);
  const [editMode, setEditMode] = useState(null); // State for tracking edited schedule
  const [newNote, setNewNote] = useState(''); // For updating notes
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [editMealId, setEditMealId] = useState(null); // Meal edit state
  const [newMealDetails, setNewMealDetails] = useState({ meal: '', date: '', time: '' }); // Editable meal details
  const navigate = useNavigate();

 // State for toggling sections
 const [showTasks, setShowTasks] = useState(true);
 const [showMeals, setShowMeals] = useState(true);
 const [showSchedules, setShowSchedules] = useState(true);
 const [showCalendar, setShowCalendar] = useState(true);
 const [showExercises, setShowExercises] = useState(true);
  const toggleMenu = () => setMenuOpen(!isMenuOpen);


  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const exerciseRef = collection(db, 'exercise');
        const snapshot = await getDocs(exerciseRef);
        const exerciseList = snapshot.docs.map((doc) => doc.data());
        setExercises(exerciseList);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching exercises:', error);
        setLoading(false);
      }
    };

    fetchExercises();
  }, []);

// Delete exercise from Firestore
const handleDeleteExercise = async (exerciseId) => {
  try {
    await deleteDoc(doc(db, 'exercise', exerciseId.toString()));
    alert('Exercise deleted successfully!');
    // Refetch the exercises after deletion
    const snapshot = await getDocs(collection(db, 'exercise'));
    const exerciseList = snapshot.docs.map((doc) => doc.data());
    setExercises(exerciseList);
  } catch (error) {
    console.error('Error deleting exercise:', error);
  }
};

  useEffect(() => {
    const fetchUserName = () => {
      const user = auth.currentUser;
      if (user) {
        setUserName(user.displayName || user.email);
      }
    };

    fetchUserName();
  }, []);

  useEffect(() => {
    const scheduleCollection = collection(db, 'studySchedules');
    const unsubscribe = onSnapshot(scheduleCollection, (snapshot) => {
      const currentDate = new Date(); // Current date

      // Filter out expired schedules and delete them
      snapshot.docs.forEach(async (docSnap) => {
        const scheduleData = docSnap.data();
        const scheduleEndDate = new Date(scheduleData.endDate.seconds * 1000);
        
        if (scheduleEndDate < currentDate) {
          // Delete expired schedule from Firestore
          await deleteDoc(doc(db, 'studySchedules', docSnap.id));
          console.log(`Deleted expired schedule: ${docSnap.id}`);
        }
        
      });

      // Set only valid schedules in state
      const validSchedules = snapshot.docs
        .map((doc) => ({ id: doc.id, ...doc.data() }))
        .filter((schedule) => new Date(schedule.endDate.seconds * 1000) >= currentDate);

      setSchedules(validSchedules);
    });

    return () => unsubscribe(); // Cleanup listener on unmount
  }, []);

  // Real-time tasks fetching using onSnapshot
  useEffect(() => {
    const tasksCollection = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
      const currentDate = new Date();
      const taskList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

      // Filter overdue tasks based on their due date
      const overdueList = taskList.filter(task => {
        const dueDate = task.dueDate ? new Date(task.dueDate.seconds * 1000) : null;
        return dueDate && dueDate < currentDate;
      });

      setTasks(taskList);
      setOverdueTasks(overdueList);
    });

    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchMeals = async () => {
      const mealCollection = collection(db, 'scheduledMeals');
      const mealSnapshot = await getDocs(mealCollection);

      const scheduledMeals = mealSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      setMeals(scheduledMeals);
    };

    fetchMeals();
  }, []);

  const handleLogout = async () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
        try {
            await signOut(auth);
            navigate('/login');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    } else {
        console.log("Logout canceled");
    }
};

  useEffect(() => {
    const fetchUserName = () => {
      const user = auth.currentUser;
      if (user) {
        setUserName(user.displayName || user.email);
      }
    };

    fetchUserName();
  }, []);

  const handleDateClick = (date) => {
    setSelectedDate(date);
  };

  const getSchedulesForDate = (date) => {
    return schedules.filter(schedule => {
      const scheduleDate = new Date(schedule.startDate?.seconds * 1000);
      return scheduleDate.toDateString() === date.toDateString();
    });
  };


// Handle edit schedule note


const handleSaveNote = async (scheduleId) => {
  const scheduleRef = doc(db, 'studySchedules', scheduleId);
  await updateDoc(scheduleRef, { note: newNote });
  setEditMode(null);
  setNewNote('');
};

// Handle delete schedule
const handleDeleteSchedule = async (scheduleId) => {
  try {
    await deleteDoc(doc(db, 'studySchedules', scheduleId));
    alert('Study schedule deleted');
  } catch (error) {
    console.error('Error deleting schedule:', error);
  } 
};

// Handle meal edit save
const handleSaveMeal = async () => {
  if (editMealId) {
    const mealRef = doc(db, 'scheduledMeals', editMealId);
    await updateDoc(mealRef, newMealDetails);
    setEditMealId(null);
    setNewMealDetails({ meal: '', date: '', time: '' });
  }
};

// Handle meal deletion
const handleDeleteMeal = async (mealId) => {
  try {
    await deleteDoc(doc(db, 'scheduledMeals', mealId));
    alert('Meal schedule deleted');
  } catch (error) {
    console.error('Error deleting meal:', error);
  }
};

  return (
    <div className="dashboard-container">
      <header className="header">
        <div className="logo-container">
          <img src={WalifiLogo} alt="Walifi Logo" className="logo" />
        </div>
        <div className="menu-container">
          <button className="hamburger" onClick={toggleMenu}>
            &#9776;
          </button>
          {isMenuOpen && (
            <div className="dropdown-menu">
              <Link to="/dashboard" className="menu-item">Dashboard</Link>
              <Link to="/create-tasks" className="menu-item">Create Tasks</Link>
              <Link to="/create-meals" className="menu-item">Create Meal Schedule</Link>
              <Link to="/create-exercises" className="menu-item">Create Exercise</Link>
              <li><Link to="/create-study-schedule">Create Study Schedule</Link></li>
              <button onClick={handleLogout} className="menu-item logout-button">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      
      <section className="welcome-section">
    <h1>Welcome, {userName || 'User'}!</h1>
    <p>Your personalized productivity dashboard at a glance.</p>
</section>
       {/* Section Toggles */}
       <section className="section-toggles">
                <button onClick={() => setShowTasks(!showTasks)}>
                    {showTasks ? 'Hide Tasks' : 'Show Tasks'}
                </button>
                <button onClick={() => setShowMeals(!showMeals)}>
                    {showMeals ? 'Hide Meals' : 'Show Meals'}
                </button>
                <button onClick={() => setShowSchedules(!showSchedules)}>
                    {showSchedules ? 'Hide Study Schedules' : 'Show Study Schedules'}
                </button>
                <button onClick={() => setShowCalendar(!showCalendar)}>
                    {showCalendar ? 'Hide Calendar' : 'Show Calendar'}
                </button>
                <button onClick={() => setShowExercises(!showExercises)}>
                      {showExercises ? 'Hide Exercises' : 'Show Exercises'}
                </button>
            </section>

            <section className="summary-cards">
                <div className="card">
                    <h3>{tasks.length}</h3>
                    <p>Tasks Pending</p>
                </div>
                <div className="card">
                <h3>{overdueTasks.length}</h3>
                <p>Overdue Tasks</p>
                </div>
                <div className="card">
                    <h3>{meals.length}</h3>
                    <p>Meals Planned</p>
                </div>
                <div className="card">
                    <h3>{exercises.length}</h3>
                    <p>Exercises Logged</p>
                </div>
            </section>
            {showExercises && (
        <section className="exercise-schedule">
          <h2>Exercises Logged</h2>
          {exercises.length > 0 ? (
            <ul>
              {exercises.map((exercise) => (
                <li key={exercise.id}>
                  <strong>{exercise.name}</strong> - {exercise.reps} reps at {exercise.time}
                  <button 
              onClick={() => handleDeleteExercise(exercise.id)} 
              className="delete-button"
            >
              Delete
            </button>
                </li>
              ))}
            </ul>
          ) : (
            <p>No exercises logged.</p>
          )}
        </section>
      )}
            {showMeals && (
        <section className="meal-schedule">
          <h2>Meals Planned</h2>
          {meals.length > 0 ? (
            <ul>
              {meals.map((meal) => (
                <li key={meal.id}>
                  {editMealId === meal.id ? (
                    <div>
                      <input
                        type="text"
                        value={newMealDetails.meal}
                        onChange={(e) => setNewMealDetails({ ...newMealDetails, meal: e.target.value })}
                        placeholder="Meal"
                      />
                      <input
                        type="date"
                        value={newMealDetails.date}
                        onChange={(e) => setNewMealDetails({ ...newMealDetails, date: e.target.value })}
                      />
                      <input
                        type="time"
                        value={newMealDetails.time}
                        onChange={(e) => setNewMealDetails({ ...newMealDetails, time: e.target.value })}
                      />
                      <button onClick={handleSaveMeal}>Save</button>
                    </div>
                  ) : (
                    <div>
                      <span>{meal.meal}</span> - <span>{meal.date}</span> at <span>{meal.time}</span>
                      <button onClick={() => setEditMealId(meal.id)}>Edit</button>
                      <button onClick={() => handleDeleteMeal(meal.id)}>Delete</button>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p>No meals scheduled.</p>
          )}
        </section>
      )}

{showTasks && (
        <section className="recent-activity">
          <h2>Recent Tasks</h2>
          <ul>
            {tasks.slice(0, 10).map((task) => (
              <li key={task.id}>
                <strong>{task.name}</strong> - Priority: 
                <span className={`priority-${task.priority ? task.priority.toLowerCase() : 'none'}`}>
                  {task.priority || 'None'}
                </span>
                {task.category && <span> | Category: <strong>{task.category}</strong></span>}
              </li>
            ))}
          </ul>
        </section>
      )}

      {overdueTasks.length > 0 && (
        <section className="overdue-tasks">
          <h2>Overdue Tasks</h2>
          <ul>
            {overdueTasks.map((task) => (
              <li key={task.id}>
                <strong>{task.name}</strong> - Due Date: {new Date(task.dueDate.seconds * 1000).toLocaleDateString()}
              </li>
            ))}
          </ul>
        </section>
      )}
            {showCalendar && (
                <section className="calendar-section">
                    <h2>Your Study Schedule Calendar</h2>
                    <Calendar onClickDay={handleDateClick} />
                    
                    <div className="schedule-details">
                        <h3>Schedules for {selectedDate.toDateString()}</h3>
                        {getSchedulesForDate(selectedDate).length > 0 ? (
                            getSchedulesForDate(selectedDate).map(schedule => (
                                <div key={schedule.id} className="schedule-card">
                                    <h4>Course Name: {schedule.courseName || 'Unnamed Course'}</h4>
                        <p><strong>Title:</strong> {schedule.title}</p>
                        <p><strong>Start Date:</strong> {new Date(schedule.startDate.seconds * 1000).toDateString()}</p>
                        <p><strong>End Date:</strong> {new Date(schedule.endDate.seconds * 1000).toDateString()}</p>

                        {/* Note Editing Section */}
                        {editMode === schedule.id ? (
                            <div>
                                <textarea
                                    value={newNote}
                                    onChange={(e) => setNewNote(e.target.value)}
                                    placeholder="Update your note here"
                                />
                                <button onClick={() => handleSaveNote(schedule.id)}>Save</button>
                                <button onClick={() => setEditMode(null)}>Cancel</button>
                            </div>
                        ) : (
                            <div>
                                <p><strong>Note:</strong> {schedule.note || 'No notes available.'}</p>
                                <button onClick={() => { setEditMode(schedule.id); setNewNote(schedule.note || ''); }}>
                                    Edit Note
                                </button>
                            </div>
                        )}

                        {/* Delete Schedule Button */}
                        <button onClick={() => handleDeleteSchedule(schedule.id)} className="delete-button">
                            Delete Schedule
                        </button>
                    </div>
                ))
            ) : (
                <p>No schedules found for this date.</p>
            )}
        </div>
    </section>
)}

      <footer className="footer">
        <p>&copy; 2024 Walifi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard; 

