import React, { useState } from 'react';
import { db } from '../firebaseConfig'; // Firebase import
import { addDoc, collection } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';

const CreateStudySchedule = () => {
  const [courses, setCourses] = useState([{ courseName: '', hours: '' }]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const navigate = useNavigate();

  const handleCourseChange = (index, field, value) => {
    const newCourses = [...courses];
    newCourses[index][field] = value;
    setCourses(newCourses);
  };

  const addCourse = () => setCourses([...courses, { courseName: '', hours: '' }]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await addDoc(collection(db, 'studySchedules'), {
        courses,
        startDate,
        endDate,
        createdAt: new Date(),
      });
      alert('Study schedule created!');
      navigate('/dashboard');
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  return (
    <div className="study-schedule-form">
      <h2>Create Study Schedule</h2>
      <form onSubmit={handleSubmit}>
        <label>Start Date:</label>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />

        <label>End Date:</label>
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />

        {courses.map((course, index) => (
          <div key={index}>
            <label>Course Name:</label>
            <input
              type="text"
              value={course.courseName}
              onChange={(e) => handleCourseChange(index, 'courseName', e.target.value)}
              required
            />
            <label>Study Hours:</label>
            <input
              type="number"
              value={course.hours}
              onChange={(e) => handleCourseChange(index, 'hours', e.target.value)}
              required
              min="1"
            />
          </div>
        ))}
        <button type="button" onClick={addCourse}>Add Another Course</button>
        <button type="submit">Create Schedule</button>
      </form>
    </div>
  );
};

export default CreateStudySchedule;
