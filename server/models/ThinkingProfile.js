import mongoose from 'mongoose';

const thinkingProfileSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    metrics: {
      problemSolving: { type: Number, default: 91, min: 0, max: 100 },
      debugging: { type: Number, default: 94, min: 0, max: 100 },
      systemThinking: { type: Number, default: 79, min: 0, max: 100 },
      adaptability: { type: Number, default: 96, min: 0, max: 100 },
      decisionMaking: { type: Number, default: 87, min: 0, max: 100 },
      codeQuality: { type: Number, default: 90, min: 0, max: 100 },
      communication: { type: Number, default: 82, min: 0, max: 100 },
      edgeCaseAwareness: { type: Number, default: 88, min: 0, max: 100 },
      failureRecovery: { type: Number, default: 93, min: 0, max: 100 },
      performanceAwareness: { type: Number, default: 85, min: 0, max: 100 },
    },
    overallReadiness: {
      type: Number,
      default: 89,
      min: 0,
      max: 100,
    },
    readinessStatus: {
      type: String,
      enum: ['Needs Preparation', 'Improving', 'Almost Ready', 'Interview Ready'],
      default: 'Interview Ready',
    },
    failureRecoveryScore: {
      type: Number,
      default: 93,
    },
    normalPerformance: {
      type: Number,
      default: 88,
    },
    pressurePerformance: {
      type: Number,
      default: 74,
    },
    aiInsights: {
      type: [String],
      default: [
        'Strong at debugging and adapting to changing requirements under tight constraints.',
        'Rapidly recovers from initial failure states by isolating edge-case inputs.',
        'Needs improvement in high-scale database query indexing and performance optimization.',
      ],
    },
    strengths: {
      type: [String],
      default: [
        'Rapid root-cause isolation in production logs',
        'Defensive coding preventing state regressions',
        'Adapts flexibly when product requirements evolve',
      ],
    },
    weaknesses: {
      type: [String],
      default: [
        'Database query indexing for sub-100ms SLAs',
        'Distributed transaction idempotency depth',
      ],
    },
  },
  {
    timestamps: true,
  }
);

const ThinkingProfile = mongoose.model('ThinkingProfile', thinkingProfileSchema);
export default ThinkingProfile;
