import mongoose from 'mongoose';

const debugTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const debugChallengeSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    slug: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Off-by-One',
        'Type Coercion',
        'Boundary Condition',
        'Concurrency & Race Condition',
        'Memory Leak',
        'Infinite Loop',
        'Logic Error',
        'Performance Bug',
      ],
      index: true,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
    },
    estimatedMinutes: {
      type: Number,
      default: 20,
    },
    incidentSeverity: {
      type: String,
      enum: ['Low', 'Medium', 'High', 'Critical'],
      default: 'High',
    },
    symptomReport: {
      type: String,
      required: true,
    },
    reproductionSteps: {
      type: [String],
      default: [],
    },
    brokenCode: {
      javascript: { type: String, required: true },
    },
    fixedSolution: {
      javascript: { type: String, required: true },
    },
    bugExplanation: {
      type: String,
      required: true,
    },
    hints: {
      type: [String],
      default: [],
    },
    testCases: [debugTestCaseSchema],
    resolvedCount: {
      type: Number,
      default: 0,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const DebugChallenge = mongoose.model('DebugChallenge', debugChallengeSchema);
export default DebugChallenge;
