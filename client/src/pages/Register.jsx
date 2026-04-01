import React, { useState, useMemo } from 'react';
import { useUser } from '../context/UserContext';

function PasswordStrength({ password }) {
  const strength = useMemo(() => {
    if (!password) return { score: 0, label: '', color: '' };
    let score = 0;
    if (password.length >= 6) score++;
    if (password.length >= 10) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;
    const labels = ['', 'Weak', 'Fair', 'Good', 'Strong', 'Very Strong'];
    const colors = ['', '#ef4444', '#f59e0b', '#3b82f6', '#10b981', '#8b5cf6'];
    return { score, label: labels[score] || 'Very Strong', color: colors[Math.min(score, 5)] };
  }, [password]);

  if (!password) return null;
  return (
    <div className="pass-strength" id="pass-strength-meter">
      <div className="pass-strength-bar">
        {[1, 2, 3, 4, 5].map(i => (
          <div
            key={i}
            className="pass-strength-seg"
            style={{ background: i <= strength.score ? strength.color : 'rgba(255,255,255,0.08)' }}
          />
        ))}
      </div>
      <span className="pass-strength-label" style={{ color: strength.color }}>
        {strength.label}
      </span>
    </div>
  );
}

export default function Register({ onSwitchToLogin }) {
  const { register } = useUser();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [agreed, setAgreed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) return setError('Please enter your name.');
    if (!email.trim()) return setError('Please enter a valid email.');
    if (password.length < 6) return setError('Password must be at least 6 characters.');
    if (password !== confirm) return setError('Passwords do not match.');
    if (!agreed) return setError('Please accept the Terms of Service to continue.');

    setLoading(true);
    const result = await register(name.trim(), email.trim(), password);
    setLoading(false);
    if (!result.success) {
      setError(result.error || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="auth-overlay">
      <div className="auth-bg-glow auth-bg-glow--1" />
      <div className="auth-bg-glow auth-bg-glow--2" />

      <div className="auth-card auth-card--wide animate-fadeUp">
        {/* Logo */}
        <div className="auth-logo">
          <div className="auth-logo-icon">✦</div>
          <div className="auth-logo-text gradient-text">NexRec</div>
          <p className="auth-logo-sub">AI-powered recommendations</p>
        </div>

        <h1 className="auth-heading">Create your account</h1>
        <p className="auth-subheading">Join thousands of users discovering amazing content</p>

        {error && (
          <div className="auth-error" id="register-error" role="alert">
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form" id="register-form">
          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-name">Full name</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">👤</span>
              <input
                id="reg-name"
                type="text"
                className="auth-input"
                placeholder="John Doe"
                value={name}
                onChange={e => setName(e.target.value)}
                autoComplete="name"
                required
              />
            </div>
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-email">Email address</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">✉️</span>
              <input
                id="reg-email"
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
            <label className="auth-label" htmlFor="reg-password">Password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">🔒</span>
              <input
                id="reg-password"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={e => setPassword(e.target.value)}
                autoComplete="new-password"
                required
              />
              <button
                type="button"
                className="auth-eye-btn"
                onClick={() => setShowPass(p => !p)}
                aria-label={showPass ? 'Hide password' : 'Show password'}
                id="reg-show-pass"
              >
                {showPass ? '🙈' : '👁️'}
              </button>
            </div>
            <PasswordStrength password={password} />
          </div>

          <div className="auth-field">
            <label className="auth-label" htmlFor="reg-confirm">Confirm password</label>
            <div className="auth-input-wrap">
              <span className="auth-input-icon">
                {confirm && (confirm === password ? '✅' : '❌')}
              </span>
              <input
                id="reg-confirm"
                type={showPass ? 'text' : 'password'}
                className="auth-input"
                placeholder="Re-enter password"
                value={confirm}
                onChange={e => setConfirm(e.target.value)}
                autoComplete="new-password"
                required
              />
            </div>
          </div>

          <label className="auth-checkbox-label auth-terms-check" htmlFor="reg-terms">
            <input
              id="reg-terms"
              type="checkbox"
              checked={agreed}
              onChange={e => setAgreed(e.target.checked)}
              className="auth-checkbox"
            />
            <span>
              I agree to the{' '}
              <a href="#" className="auth-link">Terms of Service</a> and{' '}
              <a href="#" className="auth-link">Privacy Policy</a>
            </span>
          </label>

          <button
            type="submit"
            id="register-submit"
            className="btn btn-primary auth-submit-btn"
            disabled={loading}
          >
            {loading ? (
              <span className="auth-loading"><span className="spinner-sm" /> Creating account...</span>
            ) : (
              '✦ Create Account'
            )}
          </button>
        </form>

        <div className="auth-divider"><span>Already have an account?</span></div>

        <button
          id="switch-to-login"
          className="btn btn-secondary auth-switch-btn"
          onClick={onSwitchToLogin}
        >
          Sign in instead →
        </button>
      </div>
    </div>
  );
}
