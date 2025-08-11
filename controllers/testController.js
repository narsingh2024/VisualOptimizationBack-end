const Test = require('../models/Test');

exports.createTest = async (req, res) => {
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
}

exports.getTests = async (req, res) => {
  try {
    const tests = await Test.find({ clientId: req.user.id });
    res.json(tests);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.getTest =  async (req, res) => {
  try {
    const test = await Test.findOne({ 
      _id: req.params.id, 
      clientId: req.user.id 
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.updateTestStatus = async (req, res) => {
  try {
    const { isActive } = req.body;
    const test = await Test.findOneAndUpdate(
      { _id: req.params.id, clientId: req.user.id },
      { isActive },
      { new: true }
    );
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.json(test);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.deleteTest = async (req, res) => {
  try {
    const test = await Test.findOneAndDelete({ 
      _id: req.params.id, 
      clientId: req.user.id 
    });
    
    if (!test) {
      return res.status(404).json({ error: 'Test not found' });
    }
    
    res.json({ message: 'Test deleted successfully' });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

exports.getTestAnalytics =  async (req, res) => {
  try {
    // You'll need to implement this based on your analytics requirements
    const analytics = await getTestAnalytics(req.params.id);
    res.json(analytics);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}

//////////Utile or helper 
// Helper function for analytics 
async function getTestAnalytics(testId) {
  // Implement your analytics logic here
  return {
    totalVotes: 0,
    variants: [],
    // other analytics data
  };
}

