import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import WalifiLogo from '../Walifilogo.jpg'; // Adjust path if needed
import './Dashboard.css'; 
import { signOut } from 'firebase/auth';
import { auth, db } from '../firebaseConfig'; // Adjust the path
import { collection,getDocs, onSnapshot } from 'firebase/firestore'; 


const Dashboard = () => {
  const [isMenuOpen, setMenuOpen] = useState(false);
  const [tasks, setTasks] = useState([]);
  const [meals, setMeals] = useState([]);
  const [userName, setUserName] = useState('');
  const navigate = useNavigate();
  const [schedules, setSchedules] = useState([]);

  const toggleMenu = () => setMenuOpen(!isMenuOpen);

  useEffect(() => {
    const fetchSchedules = async () => {
      const querySnapshot = await getDocs(collection(db, 'studySchedules'));
      const scheduleData = querySnapshot.docs.map((doc) => doc.data());
      setSchedules(scheduleData);
    };
    fetchSchedules();
  }, []);








  // Real-time tasks fetching using onSnapshot
  useEffect(() => {
    const tasksCollection = collection(db, 'tasks');
    const unsubscribe = onSnapshot(tasksCollection, (snapshot) => {
      const taskList = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    });

    return () => unsubscribe(); // Cleanup listener
  }, []);

  const fetchMeals = async () => {
    try {
      const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken');
      const data = await response.json();
      if (data.meals) {
        setMeals(data.meals);
      }
    } catch (error) {
      console.error("Error fetching meals:", error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  useEffect(() => {
    const fetchUserName = () => {
      const user = auth.currentUser;
      if (user) {
        setUserName(user.displayName || user.email);
      }
    };

    fetchMeals();
    fetchUserName();
  }, []);

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

      <section className="summary-cards">
        <div className="card">
          <h3>{tasks.length}</h3>
          <p>Tasks Pending</p>
        </div>
        <div className="card">
          <h3>{meals.length}</h3>
          <p>Meals Planned</p>
        </div>
        <div className="card">
          <h3>0</h3>
          <p>Exercises Logged</p>
        </div>
      </section>

      <section className="recent-activity">
        <h2>Recent Tasks</h2>
        <ul>
          {tasks.slice(0, 5).map((task, index) => (
            <li key={index}>{task.name}</li>
          ))}
        </ul>
      </section>

      <footer className="footer">
        <p>&copy; 2024 Walifi. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default Dashboard;
