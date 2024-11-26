
// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import SignUp from './pages/SignUp';
import Dashboard from './pages/Dashboard';
import { auth } from './firebaseConfig';
import { onAuthStateChanged, signOut } from 'firebase/auth';
import CreateTasks from './pages/CreateTasks';
import CreateMeals from './pages/CreateMeals'; 
import CreateExercise from './pages/CreateExercise';
import CreateStudySchedule from './pages/CreateStudySchedule';

function App() {
  const [user, setUser] = React.useState(null);

  React.useEffect(() => {
    // Monitor authentication state
    onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
    });
  }, []);

  const handleLogout = () => {
    signOut(auth).then(() => {
      console.log('User logged out');
    });
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={user ? <Navigate to="/dashboard" /> : <Login />} />
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login />} />

        <Route
          path="/dashboard"
          element={user ? <Dashboard handleLogout={handleLogout} /> : <Navigate to="/" />}
        />
        <Route path="/create-tasks" element={<CreateTasks />} />
        <Route path="/create-meals" element={<CreateMeals />} />
        <Route path="/create-exercises" element={<CreateExercise />} />
        <Route path="/create-study-schedule" element={<CreateStudySchedule />} />
       
      </Routes>
    </Router>
  );
}

export default App;
