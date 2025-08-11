// routes/testRoutes.js
const express = require('express');
const router = express.Router();
const Test = require('../models/Test');
const authMiddleware = require('../middleware/auth');

router.post('/', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'client') {
      return res.status(403).json({ error: 'Only clients can create tests' });
    }
    const test = new Test({ ...req.body, clientId: req.user.id });
    await test.save();
    res.status(201).json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

router.get('/', authMiddleware, async (req, res) => {
  try {
    const tests = await Test.find({ clientId: req.user.id });
    res.json(tests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Add other endpoints (GET /:id, PUT /:id/status, DELETE /:id)