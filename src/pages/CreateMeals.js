import React, { useState, useEffect } from 'react';
import { db } from '../firebaseConfig';
import { addDoc, collection, updateDoc, deleteDoc, doc } from 'firebase/firestore';
import './cssfiles/CreateMeals.css';

function CreateMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null);
  const [schedule, setSchedule] = useState({ date: '', time: '' });
  const [schedules, setSchedules] = useState([]); // Store all schedules
  const [editingScheduleId, setEditingScheduleId] = useState(null); // Track schedule being edited
  
  
  
  
  useEffect(() => {
    const fetchMeals = async () => {
      try {
        const response = await fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken');
        const data = await response.json();
        setMeals(data.meals || []);
      } catch (error) {
        console.error('Error fetching meals:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchMeals();
  }, []);

  // Load scheduled meals from Firestore on mount
  useEffect(() => {
    const fetchSchedules = async () => {
      try {
        const querySnapshot = await collection(db, 'scheduledMeals').get();
        setSchedules(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } catch (error) {
        console.error('Error fetching schedules:', error);
      }
    };

    fetchSchedules();
  }, []);

  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
    
  };

  const handleBack = () => {
    setSelectedMeal(null);
    setSchedule({ date: '', time: '' });
    setEditingScheduleId(null);
    
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!schedule.date || !schedule.time) {
      alert('Please select a date and time.');
      return;
    }

    const newSchedule = {
      meal: selectedMeal.strMeal,
      date: schedule.date,
      time: schedule.time,
    };

    try {
      if (editingScheduleId) {
        const scheduleRef = doc(db, 'scheduledMeals', editingScheduleId);
        await updateDoc(scheduleRef, newSchedule);
        setSchedules(prevSchedules => 
          prevSchedules.map(s => s.id === editingScheduleId ? { id: editingScheduleId, ...newSchedule } : s)
        );
        alert(`Updated schedule for ${selectedMeal.strMeal}`);
      } else {
        const docRef = await addDoc(collection(db, 'scheduledMeals'), newSchedule);
        setSchedules(prev => [...prev, { id: docRef.id, ...newSchedule }]);
        alert(`Scheduled ${selectedMeal.strMeal} on ${schedule.date} at ${schedule.time}`);
      }
      handleBack();
    } catch (error) {
      console.error('Error saving schedule:', error);
      alert('Failed to save schedule. Please try again.');
    }
  };

  const handleDeleteSchedule = async (id) => {
    try {
      await deleteDoc(doc(db, 'scheduledMeals', id));
      setSchedules(prev => prev.filter(s => s.id !== id));
      alert('Deleted meal schedule.');
    } catch (error) {
      console.error('Error deleting schedule:', error);
      alert('Failed to delete schedule. Please try again.');
    }
  };

  const handleEditSchedule = (schedule) => {
    setSelectedMeal({ strMeal: schedule.meal });
    setSchedule({ date: schedule.date, time: schedule.time });
    setEditingScheduleId(schedule.id);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule(prev => ({ ...prev, [name]: value }));
  };

  const handleCopyToClipboard = () => {
    const scheduleText = schedules.map(
      (schedule) => `${schedule.meal} - ${schedule.date} at ${schedule.time}`
    ).join('\n');
    
    navigator.clipboard.writeText(scheduleText)
      .then(() => alert('Meal schedule copied to clipboard!'))
      .catch((err) => console.error('Failed to copy schedule:', err));
  };

  const getIngredients = () => {
    if (!selectedMeal) return [];
    const ingredients = [];
    for (let i = 1; i <= 20; i++) {
      const ingredient = selectedMeal[`strIngredient${i}`];
      const measure = selectedMeal[`strMeasure${i}`];
      if (ingredient && measure) {
        ingredients.push(`${measure} ${ingredient}`);
      }
      else if (ingredient) {
        ingredients.push(ingredient);
      }
    }
    return ingredients;
  };


  
  if (loading) return <p>Loading meals...</p>;

  if (selectedMeal) {
    return (
      <div className="meal-details">
        <button onClick={handleBack}>Back to Meal List</button>
        <h2>{selectedMeal.strMeal}</h2>
        <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} style={{ width: '300px' }} />
        <h3>Ingredients</h3>
        <ul>
          {getIngredients().map((ingredient, index) => (
            <li key={index}>{ingredient}</li>
          ))}
        </ul>
        <h3>Instructions</h3>
        <p>{selectedMeal.strInstructions}</p>

       

        <h3>Schedule This Meal</h3>
        <form onSubmit={handleScheduleSubmit}>
          <label>
            Date:
            <input
              type="date"
              name="date"
              value={schedule.date}
              onChange={(e) => setSchedule({ ...schedule, date: e.target.value })}
              required
            />
          </label>
          <label>
            Time:
            <input
              type="time"
              name="time"
              value={schedule.time}
              onChange={handleChange}
              required
            />
          </label>
          <button type="submit">{editingScheduleId ? 'Update Schedule' : 'Create Schedule'}</button>
        </form>
      </div>
    );
  }

  return (
    <div className="meal-list-container">
      <h2>Create Meals</h2>
      <p>Select a meal from MealDB to see the recipe and schedule it:</p>

      <ul className="meal-list">
        {meals.map((meal) => (
          <li key={meal.idMeal} onClick={() => handleMealClick(meal)} className="meal-item">
            <h3>{meal.strMeal}</h3>
            <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '200px' }} />
          </li>
        ))}
      </ul>

      {schedules.length > 0 && (
        <div className="scheduled-meals">
          <h3>Scheduled Meals</h3>
          <ul>
            {schedules.map((schedule) => (
              <li key={schedule.id}>
                {schedule.meal} - {schedule.date} at {schedule.time}
                <button onClick={() => handleEditSchedule(schedule)}>Edit</button>
                <button onClick={() => handleDeleteSchedule(schedule.id)}>Delete</button>
              </li>
            ))}
          </ul>
          <button onClick={handleCopyToClipboard}>Copy Schedule to Share</button>
        </div>
      )}
    </div>
  );
}

export default CreateMeals;
