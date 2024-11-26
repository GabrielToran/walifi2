import React, { useState } from 'react';
import { db } from '../firebaseConfig';
import { addDoc,updateDoc, doc, collection, Timestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import './cssfiles/Login.css';

const CreateStudySchedule = ({ existingSchedule, scheduleId }) => {
  const [courses, setCourses] = useState(existingSchedule?.courses || [{ courseName: '', hours: '', notes: '', reminderMinutes: '' }]);
  const [startDate, setStartDate] = useState(existingSchedule?.startDate || '');
  const [endDate, setEndDate] = useState(existingSchedule?.endDate || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  // Schedule a reminder alert for each course
  const scheduleReminder = (course, reminderMinutes) => {
    if (!startDate || isNaN(reminderMinutes)) return;

    const courseStartTime = new Date(startDate);
    courseStartTime.setMinutes(courseStartTime.getMinutes() - reminderMinutes);

    const timeUntilReminder = courseStartTime.getTime() - new Date().getTime();
    if (timeUntilReminder > 0) {
      setTimeout(() => {
        alert(`Reminder: Time to study ${course.courseName}`);
      }, timeUntilReminder);
    }
  };

  // Set up reminders for all courses
  const setupReminders = () => {
    courses.forEach((course) => {
      if (course.reminderMinutes) {
        scheduleReminder(course, parseInt(course.reminderMinutes));
      }
    });
  };

  // Handle changes for each course field
  const handleCourseChange = (index, field, value) => {
    const newCourses = [...courses];
    newCourses[index][field] = value;
    setCourses(newCourses);
  };

  // Add a new course to the schedule
  const addCourse = () => setCourses([...courses, { courseName: '', hours: '', notes: '', reminderMinutes: '' }]);
// Remove a course from the schedule
const removeCourse = (index) => {
  const newCourses = courses.filter((_, i) => i !== index);
  setCourses(newCourses);
};
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (new Date(endDate) < new Date(startDate)) {
      setError('End date must be later than start date.');
      return;
    }

    setLoading(true);
    try {
      if (scheduleId) {
        // Update existing schedule
        const scheduleRef = doc(db, 'studySchedules', scheduleId);
        await updateDoc(scheduleRef, {
          courses,
          startDate: Timestamp.fromDate(new Date(startDate)),
          endDate: Timestamp.fromDate(new Date(endDate)),
          updatedAt: Timestamp.now(),
        });
        alert('Study schedule updated!');
      } else {
        // Create new schedule
        await addDoc(collection(db, 'studySchedules'), {
          courses,
          startDate: Timestamp.fromDate(new Date(startDate)),
          endDate: Timestamp.fromDate(new Date(endDate)),
          createdAt: Timestamp.now(),
        });
        setupReminders(); // Set reminders for the new schedule
        alert('Study schedule created!');
      }

      navigate('/dashboard');
    } catch (error) {
      setError('Failed to save the study schedule. Please try again.');
      console.error('Error saving schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get today's date in YYYY-MM-DD format to set as the minimum start date
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="login-container">
      <h2 className="login-title">{scheduleId ? 'Edit Study Schedule' : 'Create Study Schedule'}</h2>
      {error && <p className="error-message">{error}</p>}

      <form className="login-form" onSubmit={handleSubmit}>
        <div className="input-group">
          <label>Start Date:</label>
          <input
            type="date"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            required
            min={today} // Set the minimum date to today's date
          />
        </div>

        <div className="input-group">
          <label>End Date:</label>
          <input
            type="date"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            required
          />
        </div>

        {courses.map((course, index) => (
          <div key={index} className="course-input-group">
            <div className="input-group">
              <label>Course Name:</label>
              <input
                type="text"
                value={course.courseName}
                onChange={(e) => handleCourseChange(index, 'courseName', e.target.value)}
                required
              />
            </div>
            <div className="input-group">
              <label>Study Hours:</label>
              <input
                type="number"
                value={course.hours}
                onChange={(e) => handleCourseChange(index, 'hours', e.target.value)}
                required
                min="1"
              />
            </div>
            <div className="input-group">
              <label>Notes:</label>
              <textarea
                value={course.notes}
                onChange={(e) => handleCourseChange(index, 'notes', e.target.value)}
              />
            </div>
            <div className="input-group">
              <label>Reminder (minutes before):</label>
              <input
                type="number"
                value={course.reminderMinutes}
                onChange={(e) => handleCourseChange(index, 'reminderMinutes', e.target.value)}
                min="0"
              />
            </div>
            <button
              type="button"
              className="remove-course-button"
              onClick={() => removeCourse(index)}
            >
              Remove Course
            </button>
          </div>
        ))}

        <button type="button" className="add-course-button" onClick={addCourse}>
          Add Another Course
        </button>

        <button type="submit" className="login-button" disabled={loading}>
          {loading ? (scheduleId ? 'Updating...' : 'Creating...') : scheduleId ? 'Update Schedule' : 'Create Schedule'}
        </button>
      </form>
    </div>
  );
};

export default CreateStudySchedule;
