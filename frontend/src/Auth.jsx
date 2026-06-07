import React, { useState } from 'react';
import { GoogleLogin } from '@react-oauth/google';
import { Rocket, Mail, Lock, User } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import './Auth.css';

export const AuthPage = ({ mode = 'login' }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const navigate = useNavigate();

  const handleGoogleSuccess = (credentialResponse) => {
    console.log('Google Auth Success:', credentialResponse);
    // Decode token or send to backend to verify
    // const decoded = jwt_decode(credentialResponse.credential);
    navigate('/');
  };

  const handleGoogleError = () => {
    console.log('Google Auth Failed');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log(`Submitting ${mode} for:`, email);
    // Mock successful auth
    navigate('/');
  };

  return (
    <div className="auth-container animate-fade-in">
      <div className="auth-card glass-card">
        <div className="auth-header">
          <Rocket className="logo-icon" size={32} />
          <h2>{mode === 'login' ? 'Welcome back to ProductPilot' : 'Create your ProductPilot account'}</h2>
          <p>{mode === 'login' ? 'Sign in to access your workspaces and PRDs.' : 'Start turning your ideas into execution plans.'}</p>
        </div>

        <div className="auth-google-wrapper">
          <GoogleLogin
            onSuccess={handleGoogleSuccess}
            onError={handleGoogleError}
            theme="filled_black"
            size="large"
            width="360"
            text={mode === 'login' ? "signin_with" : "signup_with"}
            shape="rectangular"
          />
        </div>

        <div className="auth-divider">
          <span>or continue with email</span>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === 'signup' && (
            <div className="input-group">
              <label className="input-label">Full Name</label>
              <div className="input-with-icon">
                <User size={18} className="input-icon" />
                <input 
                  type="text" 
                  className="input-field has-icon" 
                  placeholder="Steve Jobs"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            </div>
          )}

          <div className="input-group">
            <label className="input-label">Email Address</label>
            <div className="input-with-icon">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                className="input-field has-icon" 
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="input-group">
            <label className="input-label">Password</label>
            <div className="input-with-icon">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                className="input-field has-icon" 
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </div>

          <button type="submit" className="btn btn-full">
            {mode === 'login' ? 'Sign In' : 'Sign Up'}
          </button>
        </form>

        <div className="auth-footer">
          {mode === 'login' ? (
            <p>Don't have an account? <Link to="/signup" className="auth-link">Sign up</Link></p>
          ) : (
            <p>Already have an account? <Link to="/login" className="auth-link">Sign in</Link></p>
          )}
        </div>
      </div>
    </div>
  );
};
