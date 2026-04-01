import React, { useState } from 'react';
import { useUser } from '../context/UserContext';

export default function Login({ onSwitchToRegister }) {
  const { login } = useUser();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password) {
      setError('Please enter your email and password.');
      return;
    }
    setLoading(true);
    const result = await login(email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="auth-card animate-fadeUp">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <div className="auth-logo-text gradient-text">NexRec</div>
          <p className="auth-logo-sub">Your unified content universe</p>
        </div>

        <h1 className="auth-heading">Welcome back</h1>
        <p className="auth-subheading">Sign in to your account to continue</p>

        {error && (
          <div className="auth-error" id="login-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="login-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="login-email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="login-email"
                type="email"
                className="auth-input"
                placeholder="you@example.com"
                value={email}
                onChange={e => setEmail(e.target.value)}
                autoComplete="email"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="login-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="login-password"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="Your password"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                id="login-show-pass"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          <div className="auth-row">
            <label className="auth-checkbox-label" htmlFor="login-remember">
              <input
                id="login-remember"
                type="checkbox"
                checked={rememberMe}
                onChange={e => setRememberMe(e.target.checked)}
                className="auth-checkbox"
              />
              <span>Remember me</span>
            </label>
          </div>

          <button
            type="submit"
            id="login-submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-loading"><span className="spinner-sm" /> Signing in...</span>
            ) : (
              '→ Sign In'
            )}
          </button>
        </form>

        <div className="auth-divider"><span>Don't have an account?</span></div>

        <button
          id="switch-to-register"
          className="btn btn-secondary auth-switch-btn"
          onClick={onSwitchToRegister}
        >
          Create a free account ✦
        </button>

        <p className="auth-terms">
          By signing in you agree to our{' '}
          <a href="#" className="auth-link">Terms of Service</a> and{' '}
          <a href="#" className="auth-link">Privacy Policy</a>.
        </p>
      </div>
    </div>
  );
}
