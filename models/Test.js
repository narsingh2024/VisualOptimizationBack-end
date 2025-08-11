const mongoose = require('mongoose');
const { Schema } = mongoose;

const VariantSchema = new Schema({
  name: { 
    type: String, 
    required: true,
    trim: true
  },
  imageUrl: { 
    type: String, 
    required: true 
  },
  description: { 
    type: String, 
    trim: true 
  },
  // You might want to track who created/modified the variant
  createdBy: { 
    type: Schema.Types.ObjectId, 
    ref: 'User' 
  }
}, { timestamps: true });

const TestSchema = new Schema({
  clientId: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: 100
  },
  description: { 
    type: String, 
    trim: true,
    maxlength: 500
  },
  variants: [VariantSchema],
  isActive: { 
    type: Boolean, 
    default: false 
  },
  // Feature flag controls
  settings: {
    isRealTimeEnabled: { 
      type: Boolean, 
      default: true 
    },
    isPublic: { 
      type: Boolean, 
      default: true 
    },
    // Add other feature flags as needed
  },
  // Analytics summary (can be updated periodically)
  analyticsSummary: {
    totalVotes: { 
      type: Number, 
      default: 0 
    },
    winningVariant: { 
      type: Schema.Types.ObjectId 
    },
    // Add other summary stats as needed
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for vote count (if you want to populate votes)
TestSchema.virtual('votes', {
  ref: 'Vote',
  localField: '_id',
  foreignField: 'testId'
});

// Add indexes for better query performance
TestSchema.index({ clientId: 1 });
TestSchema.index({ isActive: 1 });
TestSchema.index({ createdAt: -1 });

// Middleware to clean up votes when test is deleted
TestSchema.pre('remove', async function(next) {
  await this.model('Vote').deleteMany({ testId: this._id });
  next();
});

// Helper method to activate/deactivate test
TestSchema.methods.toggleStatus = async function() {
  this.isActive = !this.isActive;
  return this.save();
};

// Static method to get tests with vote counts
TestSchema.statics.findWithVoteCounts = async function(testId) {
  return this.aggregate([
    { $match: { _id: mongoose.Types.ObjectId(testId) } },
    {
      $lookup: {
        from: 'votes',
        localField: '_id',
        foreignField: 'testId',
        as: 'voteDetails'
      }
    },
    {
      $project: {
        title: 1,
        description: 1,
        variants: 1,
        isActive: 1,
        totalVotes: { $size: '$voteDetails' },
        variantsWithVotes: {
          $map: {
            input: '$variants',
            as: 'variant',
            in: {
              name: '$$variant.name',
              imageUrl: '$$variant.imageUrl',
              voteCount: {
                $size: {
                  $filter: {
                    input: '$voteDetails',
                    as: 'vote',
                    cond: { $eq: ['$$vote.variantId', '$$variant._id'] }
                  }
                }
              }
            }
          }
        }
      }
    }
  ]);
};

module.exports = mongoose.model('Test', TestSchema);