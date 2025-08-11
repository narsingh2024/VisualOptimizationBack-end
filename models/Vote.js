const mongoose = require('mongoose');
const { Schema } = mongoose;  // Destructure Schema from mongoose

const VoteSchema = new Schema({
  testId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Test', 
    required: true 
  },
  variantId: { 
    type: Schema.Types.ObjectId, 
    required: true 
  },
  voterId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  },
  metadata: {
    ipAddress: String,
    userAgent: String,
    votedAt: {
      type: Date,
      default: Date.now
    }
  }
}, { 
  timestamps: true 
});

// Add index for faster queries
VoteSchema.index({ testId: 1, variantId: 1 });

// Create the model
const Vote = mongoose.model('Vote', VoteSchema);

module.exports = Vote;


//module.exports = mongoose.model('Vote', TestSchema);