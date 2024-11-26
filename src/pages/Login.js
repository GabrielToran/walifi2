// client/src/pages/Login.js
import React, { useState } from 'react';
import { auth } from '../firebaseConfig';
import { signInWithEmailAndPassword, sendPasswordResetEmail, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import './cssfiles/Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [resetEmail, setResetEmail] = useState('');
  const [error, setError] = useState('');
  const [showResetForm, setShowResetForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const provider = new GoogleAuthProvider();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await signInWithEmailAndPassword(auth, email, password);
      navigate('/dashboard'); 
    } catch (err) {
      setError('Invalid email or password');
    }finally {
      setLoading(false); // Hide loading indicator
    }
  };

  const handlePasswordReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, resetEmail);
      alert('Password reset email sent! Check your inbox.');
      setShowResetForm(false);
      setResetEmail('');
    } catch (err) {
      setError('Failed to send password reset email. Please try again.');
    }finally {
      setLoading(false); // Hide loading indicator
    }

  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    try {
      await signInWithPopup(auth, provider);
      navigate('/dashboard');
    } catch (err) {
      setError('Failed to sign in with Google. Please try again.');
    } finally {
      setLoading(false);
    }
  };







  return (
    <div className="login-container">
      <form className="login-form" onSubmit={handleLogin}>
        <h2 className="login-title">Login</h2>
        <div className="input-group">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        <div className="input-group">
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
        </div>
        {error && <p className="error-message">{error}</p>}
        <button type="submit" className="login-button" disabled={loading}>
          {loading ? "Loading..." : "Login"}
        </button>
        <p className="forgot-password" onClick={() => setShowResetForm(true)}>
          Forgot Password?
        </p>
        <p className="signup-text">
          Don't have an account? <a href="/signup">Sign up</a>
        </p>
        <button className="google-login-button" onClick={handleGoogleLogin} disabled={loading}>
        {loading ? (
    "Loading..."
  ) : (
    <>
      <img
        src={require('../google-logo.png')} // Update with the correct path
        alt="Google logo"
        className="google-logo"
      />
      Log in with Google
    </>
  )}
      </button>
      </form>
      
      {showResetForm && (
        <form className="reset-form" onSubmit={handlePasswordReset}>
          <h2 className="reset-title">Reset Password</h2>
          <div className="input-group">
            <input
              type="email"
              placeholder="Enter your email"
              value={resetEmail}
              onChange={(e) => setResetEmail(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="reset-button" disabled={loading}>
            {loading ? "Sending..." : "Send Reset Email"}
          </button>
          <button
            type="button"
            className="cancel-button"
            onClick={() => setShowResetForm(false)}
          >
            Cancel
          </button>
        </form>
      )}
       {loading && <div className="loading-indicator">Loading...</div>}
    </div>
  );
};

export default Login;
