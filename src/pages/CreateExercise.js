import React, { useState, useEffect } from 'react';

function CreateExercise() {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [schedule, setSchedule] = useState([]);

  // Fetching data from ACE DB (wger API)
  useEffect(() => {
    fetch('https://wger.de/api/v2/exerciseinfo/?language=2')
      .then((response) => response.json())
      .then((data) => {
        setExercises(data.results);
        setLoading(false);
      })
      .catch((error) => console.error('Error fetching exercises:', error));
  }, []);

  // Add exercise to selected list
  const handleSelectExercise = (exercise) => {
    if (!selectedExercises.includes(exercise)) {
      setSelectedExercises([...selectedExercises, exercise]);
    }
  };

  // Create a schedule with selected exercises
  const handleCreateSchedule = () => {
    setSchedule(selectedExercises);
    setSelectedExercises([]); // Clear selected exercises after schedule is created
    alert('Exercise schedule created!');
  };

  if (loading) {
    return <p>Loading exercises...</p>;
  }

  return (
    <div>
      <h2>Create Exercise</h2>
      <p>Select an exercise from ACE DB (wger API):</p>

      {/* Display exercise list */}
      <ul>
        {exercises.map((exercise) => (
          <li key={exercise.id}>
            <h3>{exercise.name}</h3>
            <p>{exercise.description.substring(0, 100)}...</p>
            <button onClick={() => handleSelectExercise(exercise)}>
              Add to Schedule
            </button>
            <button
              onClick={() => alert(`Exercise Details:\n\n${exercise.description}`)}
              style={{ marginLeft: '10px' }}
            >
              View Details
            </button>
          </li>
        ))}
      </ul>

      {/* Display selected exercises */}
      {selectedExercises.length > 0 && (
        <div>
          <h3>Selected Exercises:</h3>
          <ul>
            {selectedExercises.map((exercise) => (
              <li key={exercise.id}>
                <h4>{exercise.name}</h4>
                <p>{exercise.description.substring(0, 150)}...</p>
                <button onClick={() => alert(`Exercise Details:\n\n${exercise.description}`)}>
                  View Full Details
                </button>
              </li>
            ))}
          </ul>
          <button onClick={handleCreateSchedule}>Create Exercise Schedule</button>
        </div>
      )}

      {/* Display created schedule */}
      {schedule.length > 0 && (
        <div>
          <h3>Your Exercise Schedule:</h3>
          <ul>
            {schedule.map((exercise) => (
              <li key={exercise.id}>
                <h4>{exercise.name}</h4>
                <p>{exercise.description.substring(0, 150)}...</p>
                <button onClick={() => alert(`Exercise Details:\n\n${exercise.description}`)}>
                  View Full Details
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export default CreateExercise;
