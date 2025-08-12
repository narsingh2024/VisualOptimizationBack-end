// controllers/authController.js
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

// -------------------- REGISTER --------------------
exports.register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    console.log("[REGISTER] Incoming data:", { username, email, role });

    // Check if user already exists
    const existingUser = await User.findOne({ email: new RegExp(`^${email}$`, 'i') });
    if (existingUser) {
      return res.status(400).json({ error: 'Email already in use' });
    }

    const user = new User({
      username,
      email,
      password: password, // bcrypt from schema using mongo comparison
      role
    });
    await user.save();

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set HTTP-only cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 3600000 // 1 hour
    });

    res.status(201).json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error("[REGISTER] Error:", error);
    res.status(400).json({ error: error.message });
  }
};

// -------------------- LOGIN --------------------
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("[LOGIN] Incoming:", { email, password });

    // Find user (case-insensitive)
    const user = await User.findOne({
      email: { $regex: new RegExp(`^${email}$`, 'i') }
    });

    if (!user) {
      console.log("[LOGIN] No user found with email:", email);
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    console.log("[LOGIN] Stored hash from DB:", user.password);

    // Compare entered password with stored hash
    const match = await bcrypt.compare(password, user.password);
    console.log("[LOGIN] Password match result:", match);

    if (!match) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    // Generate token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    // Set cookie
    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'none',
      maxAge: 3600000
    });

    // Also send token in response body
    res.json({
      user: {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role
      },
      token
    });

  } catch (error) {
    console.error("[LOGIN] Error:", error);
    res.status(500).json({ error: 'Server error' });
  }
};

exports.getMe = async (req, res) => {
 
  res.status(200).json(req.user);

  // try {
  //   // Check cookie first
  //   const token = req.cookies.token;
    
  //   // Fallback to authorization header
  //   const authHeader = req.headers.authorization;
  //   const headerToken = authHeader?.split(' ')[1];
    
  //   const jwtToken = token || headerToken;
  //   ///////////
  //   console.log('getMe called');
  //   console.log('Cookies:', req.cookies);
  //   console.log('Auth header:', req.headers.authorization);
  //   //////////
  //   if (!jwtToken) {
  //     return res.status(401).json({ error: 'Not authenticated' });
  //   }

  //   const decoded = jwt.verify(jwtToken, process.env.JWT_SECRET);
  //   const user = await User.findById(decoded.id).select('-password');
    
  //   if (!user) {
  //     return res.status(404).json({ error: 'User not found' });
  //   }

  //   res.json(user);
  // } catch (error) {
  //   res.status(401).json({ error: 'Invalid token' });
  // }
};