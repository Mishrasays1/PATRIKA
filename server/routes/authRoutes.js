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
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });
    if (user) {
      return res.json({ user, message: 'Existing account found in MongoDB Atlas.' });
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

    user = new User({
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
    console.log(`[Atlas Auth] Registered new user to MongoDB: ${user.email} (@${user.username})`);

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'patrika_jwt_secret_2026',
      { expiresIn: '7d' }
    );

    res.json({ user, token });
  } catch (err) {
    console.error('Atlas Register error:', err);
    res.status(500).json({ error: err.message });
  }
});

// POST Login with Email & Password
router.post('/login', async (req, res) => {
  try {
    const { email } = req.body;
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
    console.error('Atlas Login error:', err);
    res.status(500).json({ error: err.message });
  }
});

// DEDICATED ADMIN REGISTRATION REQUEST
router.post('/admin/register', async (req, res) => {
  try {
    const { name, email, reason, developerPasskey } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Developer Passkey Auto-Approval Check
    const isAutoApproved = developerPasskey === 'PATRIKA_DEV_2026' || developerPasskey === 'DEV123' || cleanEmail.includes('rahulkrmishra') || cleanEmail.includes('mishrasays1');

    if (!user) {
      let baseUsername = `admin_${cleanEmail.split('@')[0].toLowerCase().replace(/[^a-z0-9_]/g, '_')}`;
      user = new User({
        name: name || `Admin ${cleanEmail.split('@')[0]}`,
        username: baseUsername,
        email: cleanEmail,
        role: isAutoApproved ? 'admin' : 'reporter',
        adminApprovalStatus: isAutoApproved ? 'approved' : 'pending',
        isAdminVerified: isAutoApproved,
        adminRequestReason: reason || 'Requested Admin Fact-Checking Verification Access',
        avatar: `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(cleanEmail)}`,
        bio: isAutoApproved ? 'Verified Lead Admin & Fact Checker' : 'Pending Admin Candidate',
        reputationScore: 100,
        badges: isAutoApproved ? ['Verified Admin', 'Lead Fact Checker'] : ['Admin Candidate']
      });
      await user.save();
    } else {
      if (isAutoApproved) {
        user.role = 'admin';
        user.adminApprovalStatus = 'approved';
        user.isAdminVerified = true;
        if (!user.badges.includes('Verified Admin')) user.badges.push('Verified Admin');
        await user.save();
      } else if (!user.isAdminVerified && user.role !== 'admin') {
        user.adminApprovalStatus = 'pending';
        user.adminRequestReason = reason || user.adminRequestReason;
        await user.save();
      }
    }

    if (user.isAdminVerified || user.role === 'admin') {
      const token = jwt.sign(
        { userId: user._id, email: user.email, role: 'admin' },
        process.env.JWT_SECRET || 'patrika_jwt_secret_2026',
        { expiresIn: '7d' }
      );
      return res.json({ user, token, message: 'Admin account approved and verified!' });
    }

    res.json({
      user,
      pending: true,
      message: 'Your Admin Access Request has been submitted and is pending approval by the Lead Developer.'
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// DEDICATED ADMIN LOGIN
router.post('/admin/login', async (req, res) => {
  try {
    const { email, password, developerPasskey } = req.body;
    if (!email) {
      return res.status(400).json({ error: 'Email address is required.' });
    }

    const cleanEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: cleanEmail });

    // Developer Passkey Override
    const isDevPass = developerPasskey === 'PATRIKA_DEV_2026' || developerPasskey === 'DEV123' || cleanEmail.includes('rahulkrmishra') || cleanEmail.includes('mishrasays1');

    if (isDevPass && user) {
      user.role = 'admin';
      user.isAdminVerified = true;
      user.adminApprovalStatus = 'approved';
      await user.save();
    }

    if (!user) {
      return res.status(400).json({ error: 'No Admin account found with this email. Please submit an Admin Access Request.' });
    }

    if (!user.isAdminVerified && user.role !== 'admin') {
      if (user.adminApprovalStatus === 'pending') {
        return res.status(403).json({ error: 'Your Admin Access Request is pending approval by the Lead Developer. You cannot log in as Admin yet.' });
      }
      return res.status(403).json({ error: 'Access Denied: Only developer-verified Admins can access the Admin Portal.' });
    }

    const token = jwt.sign(
      { userId: user._id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET || 'patrika_jwt_secret_2026',
      { expiresIn: '7d' }
    );

    res.json({ user, token, message: 'Welcome to the PATRIKA Admin & Fact-Checking Portal!' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST Developer Approve Admin Request
router.post('/admin/approve-user', async (req, res) => {
  try {
    const { targetUserId, developerPasskey } = req.body;
    if (developerPasskey !== 'PATRIKA_DEV_2026' && developerPasskey !== 'DEV123') {
      return res.status(401).json({ error: 'Invalid Developer Access Passkey' });
    }

    const user = await User.findById(targetUserId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    user.role = 'admin';
    user.adminApprovalStatus = 'approved';
    user.isAdminVerified = true;
    if (!user.badges.includes('Verified Admin')) user.badges.push('Verified Admin');

    await user.save();
    res.json({ message: `Successfully approved @${user.username} as Verified Admin!`, user });
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

    const email = googleUser.email.toLowerCase().trim();
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
        name: googleUser.name || email.split('@')[0],
        username: finalUsername,
        email: email,
        role: 'reporter',
        avatar: googleUser.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
        bio: 'Citizen Journalist & Fact Checker',
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
    const { name, username, role, bio, location } = req.body;
    const userId = req.params.id;

    // Prevent regular non-admin users from self-promoting to admin
    let safeRole = role;
    if (role === 'admin') {
      const currentUserDoc = await User.findById(userId);
      if (!currentUserDoc?.isAdminVerified) {
        safeRole = currentUserDoc?.role || 'reporter';
      }
    }

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
        ...(safeRole && { role: safeRole }),
        ...(bio && { bio }),
        ...(location && { location })
      },
      { new: true, runValidators: true }
    );

    res.json(updatedUser);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
