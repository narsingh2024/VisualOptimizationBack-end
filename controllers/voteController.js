 const mongoose = require('mongoose');
const { io } = require('../server');
const Test = require('../models/Test');
const Vote = require('../models/Vote');
exports.submitVote = async (req, res) => {
  try {
    const { testId } = req.params;
    const { variantId } = req.body;
    
    // Basic validation
    if (!mongoose.Types.ObjectId.isValid(testId)) {
      return res.status(400).json({ error: 'Invalid test ID' });
    }
    
    if (!mongoose.Types.ObjectId.isValid(variantId)) {
      return res.status(400).json({ error: 'Invalid variant ID' });
    }

    // Check if test exists and is active
    const test = await Test.findById(testId);
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    if (!test.isActive) {
      return res.status(400).json({ error: 'This test is not currently active' });
    }

    // Check if variant exists in this test
    const variantExists = test.variants.some(v => v._id.equals(variantId));
    if (!variantExists) {
      return res.status(400).json({ error: 'Variant not found in this test' });
    }

    // Create and save vote
    const vote = new Vote({
      testId,
      variantId,
      voterId: req.user?.id, // Optional if you track voters
      metadata: {
        ipAddress: req.ip,
        userAgent: req.headers['user-agent']
      }
    });
    
    await vote.save();

    // Get updated vote count
    const voteCount = await Vote.countDocuments({ testId, variantId });

    // Emit real-time update
    io.to(testId).emit('voteUpdate', {
      testId,
      variantId,
      newVoteCount: voteCount
    });

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully',
      voteCount
    });

  } catch (error) {
    console.error('Vote submission error:', error);
    res.status(500).json({ error: 'Failed to submit vote' });
  }
};


