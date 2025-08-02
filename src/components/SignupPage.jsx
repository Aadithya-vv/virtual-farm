import React, { useState } from 'react';
import { auth } from '../firebase';
import { createUserWithEmailAndPassword } from 'firebase/auth';

export default function SignupPage({ setUser, goToLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const signup = async () => {
    try {
      const userCred = await createUserWithEmailAndPassword(auth, email, password);
      setUser(userCred.user);
    } catch (e) {
      console.error(e);
      switch (e.code) {
        case 'auth/email-already-in-use': setError('This email is already registered.'); break;
        case 'auth/invalid-email': setError('Invalid email address.'); break;
        case 'auth/weak-password': setError('Password should be at least 6 characters.'); break;
        default: setError('Signup failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      <h2>Sign Up</h2>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="Email" />
      <div className="password-field">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password} onChange={e => setPassword(e.target.value)}
          placeholder="Password"
        />
        <button
          type="button"
          className="toggle-btn"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? 'Hide' : 'Show'}
        </button>
      </div>
      <button onClick={signup}>Sign Up</button>
      {error && <p className="error">{error}</p>}
      <p>Already have an account? <span className="link" onClick={goToLogin}>Log in</span></p>
    </div>
  );
}
