const express = require('express');
const router = express.Router();
const voteController = require('../controllers/voteController');
const testController = require('../controllers/testController');
const authMiddleware = require('../middleware/auth');

// Create new A/B test
router.post('/', authMiddleware, testController.createTest);
// List all tests for a client
router.get('/', authMiddleware, testController.getTests);
// Get specific test details
router.get('/:id', authMiddleware, testController.getTest);
// Activate/Deactivate test (feature flag)
router.put('/:id/status', authMiddleware, testController.updateTestStatus);
// Delete test
router.delete('/:id', authMiddleware, testController.deleteTest);
// Get test analytics
router.get('/:id/analytics', authMiddleware,testController.getTestAnalytics);


//////////////// can we create a voteController.js file?
// Submit vote for test variant
router.post('/:id/vote', authMiddleware, voteController.submitVote);


module.exports = router;