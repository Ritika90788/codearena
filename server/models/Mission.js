import mongoose from 'mongoose';

const missionTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const missionSchema = new mongoose.Schema(
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
    domain: {
      type: String,
      required: true,
      enum: ['E-commerce', 'FinTech', 'Food Delivery', 'Social Media', 'Logistics', 'EdTech'],
      index: true,
    },
    companyName: {
      type: String,
      required: true,
    },
    difficulty: {
      type: String,
      enum: ['Medium', 'Hard', 'Staff Engineer'],
      default: 'Medium',
    },
    estimatedMinutes: {
      type: Number,
      default: 45,
    },
    companyScenario: {
      type: String,
      required: true,
    },
    businessProblem: {
      type: String,
      required: true,
    },
    technicalRequirements: {
      type: [String],
      required: true,
    },
    functionalRequirements: {
      type: [String],
      required: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    expectedBehavior: {
      type: String,
      required: true,
    },
    evaluationCriteria: [
      {
        name: { type: String, required: true },
        weight: { type: Number, default: 25 },
        description: { type: String, default: '' },
      },
    ],
    starterCode: {
      javascript: { type: String, default: '' },
      python: { type: String, default: '' },
      cpp: { type: String, default: '' },
      java: { type: String, default: '' },
      c: { type: String, default: '' },
    },
    solutionCode: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    testCases: [missionTestCaseSchema],
    completionsCount: {
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

const Mission = mongoose.model('Mission', missionSchema);
export default Mission;
