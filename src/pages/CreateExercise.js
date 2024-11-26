import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig'; // Import your Firebase setup

function CreateExercise({ onUpdate }) {
  const [exercises, setExercises] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedExercises, setSelectedExercises] = useState([]);
  const [schedule, setSchedule] = useState([]);
  const [workoutLogs, setWorkoutLogs] = useState({});

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

  // Remove exercise from selected list
  const handleRemoveExercise = (id) => {
    setSelectedExercises(selectedExercises.filter((ex) => ex.id !== id));
  };

  // Log workout data for an exercise
  const handleLogWorkout = (exerciseId) => {
    const date = prompt('Enter workout date (YYYY-MM-DD):');
    const sets = prompt('Enter number of sets:');
    const reps = prompt('Enter number of reps per set:');
    const weight = prompt('Enter weight lifted (if applicable):');

    if (date && sets && reps) {
      const newLog = {
        date,
        sets: parseInt(sets),
        reps: parseInt(reps),
        weight: weight ? parseFloat(weight) : null,
      };

      setWorkoutLogs((prevLogs) => ({
        ...prevLogs,
        [exerciseId]: prevLogs[exerciseId]
          ? [...prevLogs[exerciseId], newLog]
          : [newLog],
      }));

      alert('Workout logged successfully!');
    } else {
      alert('Please fill in all the required fields.');
    }
  };

  // Save selected exercises to Firestore (Create or update the exercise in the collection)
  const saveExerciseToFirestore = async () => {
    try {
      const exerciseRef = collection(db, 'exercise'); // Reference the 'exercise' collection
      for (const exercise of selectedExercises) {
        const exerciseDocRef = doc(exerciseRef, exercise.id.toString()); // Use the exercise ID as document ID
        await setDoc(exerciseDocRef, exercise); // Save the exercise data in Firestore
      }
      alert('Exercises saved successfully!');
    } catch (error) {
      console.error('Error saving exercises:', error);
    }
  };

  // Create a schedule with selected exercises
  const handleCreateSchedule = () => {
    setSchedule(selectedExercises);
    setSelectedExercises([]); // Clear selected exercises after schedule is created
    saveExerciseToFirestore(); // Save the exercises to Firestore
    alert('Exercise schedule created!');
  };

// Delete exercise from Firestore








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

      {/* Display selected exercises with edit and delete options */}
      {selectedExercises.length > 0 && (
        <div>
          <h3>Selected Exercises:</h3>
          <ul>
            {selectedExercises.map((exercise) => (
              <li key={exercise.id}>
                <h4>{exercise.name}</h4>
                <p>{exercise.description.substring(0, 150)}...</p>
                <button onClick={() => handleLogWorkout(exercise.id)}>
                  Log Workout
                </button>
                <button onClick={() => handleRemoveExercise(exercise.id)}>
                  Remove
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
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Display workout logs */}
      {Object.keys(workoutLogs).length > 0 && (
        <div>
          <h3>Your Workout Logs:</h3>
          {Object.keys(workoutLogs).map((exerciseId) => (
            <div key={exerciseId}>
              <h4>Exercise {exerciseId} Logs</h4>
              <ul>
                {workoutLogs[exerciseId].map((log, index) => (
                  <li key={index}>
                    <p>
                      {log.date}: {log.sets} sets x {log.reps} reps (Weight: {log.weight || 'N/A'})
                    </p>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default CreateExercise;
