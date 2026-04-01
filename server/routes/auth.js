/**
 * Auth Routes — Register / Login / Me / Preferences
 * Uses bcryptjs for password hashing, jsonwebtoken for tokens,
 * and a local JSON file as a simple persistent user store.
 */

import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { readFileSync, writeFileSync } from 'fs';
import { fileURLToPath } from 'url';
import path from 'path';

const router = express.Router();
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const USERS_FILE = path.join(__dirname, '../data/users.json');
const JWT_SECRET = process.env.JWT_SECRET || 'nexrec_super_secret_2024_change_me';
const TOKEN_EXPIRY = '7d';

// ── Helpers ───────────────────────────────────────────────────────
function readUsers() {
  try {
    return JSON.parse(readFileSync(USERS_FILE, 'utf-8'));
  } catch {
    return [];
  }
}

function writeUsers(users) {
  writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY });
}

function safeUser(user) {
  const { password, ...safe } = user;
  return safe;
}

// ── Middleware: verify JWT ────────────────────────────────────────
export function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, error: 'No token provided' });
  }
  try {
    const token = header.slice(7);
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    return res.status(401).json({ success: false, error: 'Token expired or invalid' });
  }
}

// ── POST /api/auth/register ───────────────────────────────────────
router.post('/register', async (req, res) => {
  const { name, email, password } = req.body;

  // Validation
  if (!name || !email || !password) {
    return res.status(400).json({ success: false, error: 'Name, email and password are required' });
  }
  if (password.length < 6) {
    return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
  }
  const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRe.test(email)) {
    return res.status(400).json({ success: false, error: 'Invalid email address' });
  }

  const users = readUsers();
  const existing = users.find(u => u.email.toLowerCase() === email.toLowerCase());
  if (existing) {
    return res.status(409).json({ success: false, error: 'An account with this email already exists' });
  }

  const hashed = await bcrypt.hash(password, 12);
  const newUser = {
    id: `user_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    name: name.trim(),
    email: email.toLowerCase().trim(),
    password: hashed,
    preferences: {
      likedGenres: [],
      likedDomains: [],
      likedTags: [],
      dislikedGenres: [],
    },
    onboardingDone: false,
    createdAt: new Date().toISOString(),
  };

  users.push(newUser);
  writeUsers(users);

  const token = signToken({ id: newUser.id, email: newUser.email, name: newUser.name });
  return res.status(201).json({ success: true, token, user: safeUser(newUser) });
});

// ── POST /api/auth/login ──────────────────────────────────────────
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ success: false, error: 'Email and password are required' });
  }

  const users = readUsers();
  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase().trim());
  if (!user) {
    return res.status(401).json({ success: false, error: 'No account found with this email' });
  }

  const match = await bcrypt.compare(password, user.password);
  if (!match) {
    return res.status(401).json({ success: false, error: 'Incorrect password' });
  }

  // Update last login
  user.lastLoginAt = new Date().toISOString();
  writeUsers(users);

  const token = signToken({ id: user.id, email: user.email, name: user.name });
  return res.json({ success: true, token, user: safeUser(user) });
});

// ── GET /api/auth/me ──────────────────────────────────────────────
router.get('/me', requireAuth, (req, res) => {
  const users = readUsers();
  const user = users.find(u => u.id === req.user.id);
  if (!user) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  return res.json({ success: true, user: safeUser(user) });
});

// ── PUT /api/auth/preferences ─────────────────────────────────────
router.put('/preferences', requireAuth, (req, res) => {
  const { preferences, onboardingDone } = req.body;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }
  if (preferences) users[idx].preferences = { ...users[idx].preferences, ...preferences };
  if (onboardingDone !== undefined) users[idx].onboardingDone = onboardingDone;
  writeUsers(users);
  return res.json({ success: true, user: safeUser(users[idx]) });
});

// ── PUT /api/auth/profile ─────────────────────────────────────────
router.put('/profile', requireAuth, async (req, res) => {
  const { name, currentPassword, newPassword } = req.body;
  const users = readUsers();
  const idx = users.findIndex(u => u.id === req.user.id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'User not found' });
  }

  if (name) users[idx].name = name.trim();

  if (newPassword) {
    if (!currentPassword) {
      return res.status(400).json({ success: false, error: 'Current password required to set a new password' });
    }
    const match = await bcrypt.compare(currentPassword, users[idx].password);
    if (!match) {
      return res.status(401).json({ success: false, error: 'Current password is incorrect' });
    }
    if (newPassword.length < 6) {
      return res.status(400).json({ success: false, error: 'New password must be at least 6 characters' });
    }
    users[idx].password = await bcrypt.hash(newPassword, 12);
  }

  writeUsers(users);
  return res.json({ success: true, user: safeUser(users[idx]) });
});

export default router;
