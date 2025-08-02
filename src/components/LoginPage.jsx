import React, { useState } from 'react';
import { auth } from '../firebase';
import { signInWithEmailAndPassword } from 'firebase/auth';

export default function LoginPage({ setUser, goToSignup }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const login = async () => {
    try {
      const userCred = await signInWithEmailAndPassword(auth, email, password);
      setUser(userCred.user);
    } catch (e) {
      console.error(e);
      switch (e.code) {
        case 'auth/user-not-found': setError('User not found. Please sign up first.'); break;
        case 'auth/wrong-password': setError('Incorrect password.'); break;
        case 'auth/invalid-email': setError('Invalid email address.'); break;
        default: setError('Login failed. Please try again.');
      }
    }
  };

  return (
    <div className="auth-page">
      <h2>Log In</h2>
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
      <button onClick={login}>Log In</button>
      {error && <p className="error">{error}</p>}
      <p>Don't have an account? <span className="link" onClick={goToSignup}>Sign up</span></p>
    </div>
  );
}
