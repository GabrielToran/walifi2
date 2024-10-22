import React, { useState, useEffect } from 'react';

function CreateMeals() {
  const [meals, setMeals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedMeal, setSelectedMeal] = useState(null); // State to track the selected meal
  const [schedule, setSchedule] = useState({ date: '', time: '' }); // State for meal schedule
  const [schedules, setSchedules] = useState([]); // State to store all schedules

  // Fetching data from the MealDB API
  useEffect(() => {
    fetch('https://www.themealdb.com/api/json/v1/1/search.php?s=chicken') // Searching for chicken meals
      .then((response) => response.json())
      .then((data) => {
        setMeals(data.meals);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching meals:', error));
  }, []);

  // Function to handle when a meal is clicked
  const handleMealClick = (meal) => {
    setSelectedMeal(meal);
  };

  // Function to go back to the meal list
  const handleBack = () => {
    setSelectedMeal(null);
    setSchedule({ date: '', time: '' }); // Reset schedule state
  };

  // Function to handle schedule submission
  const handleScheduleSubmit = (e) => {
    e.preventDefault();
    if (selectedMeal && schedule.date && schedule.time) {
      const newSchedule = {
        meal: selectedMeal.strMeal,
        date: schedule.date,
        time: schedule.time,
      };
      setSchedules((prevSchedules) => [...prevSchedules, newSchedule]); // Add new schedule
      alert(`Scheduled ${selectedMeal.strMeal} on ${schedule.date} at ${schedule.time}`);
      handleBack(); // Go back to meal list after scheduling
    } else {
      alert("Please select a meal and set the date and time.");
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setSchedule((prevSchedule) => ({ ...prevSchedule, [name]: value }));
  };

  if (loading) {
    return <p>Loading meals...</p>;
  }

  // If a meal is selected, show the full recipe details
  if (selectedMeal) {
    return (
      <div>
        <button onClick={handleBack}>Back to meal list</button>
        <h2>{selectedMeal.strMeal}</h2>
        <img src={selectedMeal.strMealThumb} alt={selectedMeal.strMeal} style={{ width: '300px' }} />
        <h3>Instructions:</h3>
        <p>{selectedMeal.strInstructions}</p>
        <h3>Ingredients:</h3>
        <ul>
          {/* Loop through ingredients (MealDB API provides up to 20 ingredient fields) */}
          {Array.from({ length: 20 }, (_, i) => i + 1).map((i) => {
            const ingredient = selectedMeal[`strIngredient${i}`];
            const measure = selectedMeal[`strMeasure${i}`];
            if (ingredient && ingredient.trim()) {
              return (
                <li key={i}>
                  {ingredient} - {measure}
                </li>
              );
            }
            return null;
          })}
        </ul>

        {/* Schedule Form */}
        <h3>Schedule This Meal</h3>
        <form onSubmit={handleScheduleSubmit}>
          <label>
            Date:
            <input type="date" name="date" value={schedule.date} onChange={handleChange} required />
          </label>
          <label>
            Time:
            <input type="time" name="time" value={schedule.time} onChange={handleChange} required />
          </label>
          <button type="submit">Create Schedule</button>
        </form>
      </div>
    );
  }

  // Default: show meal list
  return (
    <div>
      <h2>Create Meals</h2>
      <p>Select a meal from MealDB to see the recipe:</p>
      <ul>
        {meals.map((meal) => (
          <li key={meal.idMeal} onClick={() => handleMealClick(meal)} style={{ cursor: 'pointer' }}>
            <h3>{meal.strMeal}</h3>
            <img src={meal.strMealThumb} alt={meal.strMeal} style={{ width: '200px' }} />
            <p>{meal.strInstructions.substring(0, 100)}...</p>
          </li>
        ))}
      </ul>

      {/* Display Scheduled Meals */}
      {schedules.length > 0 && (
        <div>
          <h3>Scheduled Meals</h3>
          <ul>
            {schedules.map((schedule, index) => (
              <li key={index}>
                {schedule.meal} - {schedule.date} at {schedule.time}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CreateMeals;
