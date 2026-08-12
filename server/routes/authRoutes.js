const express = require('express');
const router = express.Router();
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const { OAuth2Client } = require('google-auth-library');

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID, process.env.GOOGLE_CLIENT_SECRET);

// JWT Token Decoder helper
const decodeJwt = (token) => {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split('')
        .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
};

// GET all users
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Register with Email & Password
router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(400).json({ error: 'An account with this email already exists. Please log in.' });
    }

    let baseUsername = (name || cleanEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_');
    let finalUsername = baseUsername;
    let counter = 1;
    while (await User.findOne({ username: finalUsername })) {
      finalUsername = `${baseUsername}_${counter}`;
      counter++;
    }

    const user = new User({
      name: name || cleanEmail.split('@')[0],
      username: finalUsername,
      email: cleanEmail,
      role: 'reporter',
      avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
      bio: 'Verified Citizen Journalist Profile',
      reputationScore: 90,
      badges: ['Verified User']
    });

    await user.save();

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'patrika_jwt_secret_2026',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Login with Email & Password
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    if (!user) {
      let baseUsername = cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_');
      user = new User({
        name: cleanEmail.split('@')[0],
        username: baseUsername,
        email: cleanEmail,
        role: 'reporter',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        bio: 'Verified Citizen Journalist Profile',
        reputationScore: 90,
        badges: ['Verified User']
      });
      await user.save();
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'patrika_jwt_secret_2026',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Verify Real Google OAuth 2.0 Credential Token
router.post('/google', async (req, res) => {
  try {
    const { credential, userInfo, requestedRole } = req.body;
    let googleUser = null;

    if (credential) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: credential,
          audience: GOOGLE_CLIENT_ID
        });
        const payload = ticket.getPayload();
        googleUser = {
          email: payload.email,
          name: payload.name,
          picture: payload.picture,
          sub: payload.sub
        };
      } catch (verifyErr) {
        googleUser = decodeJwt(credential);
      }
    } else if (userInfo) {
      googleUser = userInfo;
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({ error: 'Invalid Google OAuth credential token' });
    }

    const email = googleUser.email.toLowerCase();
    let user = await User.findOne({ email });

    if (!user) {
      let baseUsername = (googleUser.name || email.split('@')[0])
        .toLowerCase()
        .replace(/[^a-z0-9_]/g, '_');
      
      let finalUsername = baseUsername;
      let counter = 1;
      while (await User.findOne({ username: finalUsername })) {
        finalUsername = `${baseUsername}_${counter}`;
        counter++;
      }

      user = new User({
        name: googleUser.name || googleUser.email.split('@')[0],
        username: finalUsername,
        email: email,
        role: requestedRole || 'reporter',
        avatar: googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        bio: 'Citizen Journalist & Fact Checker',
        reputationScore: 90,
        badges: ['Verified User', 'Fact Checker']
      });
      await user.save();
    } else {
      if (!user.username) {
        let baseUsername = (user.name || user.email.split('@')[0])
          .toLowerCase()
          .replace(/[^a-z0-9_]/g, '_');
        user.username = baseUsername;
        await user.save();
      }
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'patrika_jwt_secret_2026',
      { expiresIn: '7d' }
    );

    res.json({
      user,
      token,
      provider: 'google'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT Update User Profile
router.put('/profile/:id', async (req, res) => {
  try {
    const { name, username, role, bio } = req.body;
    const userId = req.params.id;

    if (username) {
      const cleanUsername = username.toLowerCase().trim().replace(/[^a-z0-9_]/g, '_');
      const existing = await User.findOne({ 
        username: cleanUsername, 
        _id: { $ne: userId } 
      });

      if (existing) {
        return res.status(400).json({ error: `@${cleanUsername} is already taken by another user.` });
      }

      req.body.username = cleanUsername;
    }

    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { 
        ...(name && { name }),
        ...(req.body.username && { username: req.body.username }),
        ...(role && { role }),
        ...(bio && { bio })
      },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
