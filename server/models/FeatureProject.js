import mongoose from 'mongoose';

const featureEndpointSchema = new mongoose.Schema({
  method: { type: String, required: true },
  path: { type: String, required: true },
  description: { type: String, required: true },
  requestBody: { type: String, default: '' },
  responseFormat: { type: String, default: '' },
  statusCodes: { type: [Number], default: [200] },
});

const featureTestCaseSchema = new mongoose.Schema({
  input: { type: String, required: true },
  expectedOutput: { type: String, required: true },
  isHidden: { type: Boolean, default: false },
  explanation: { type: String, default: '' },
});

const featureProjectSchema = new mongoose.Schema(
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
      enum: ['Microservices & APIs', 'System Infrastructure', 'E-commerce & Payments', 'Data & Caching'],
      index: true,
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
    featureScenario: {
      type: String,
      required: true,
    },
    endpoints: [featureEndpointSchema],
    functionalRequirements: {
      type: [String],
      required: true,
    },
    nonFunctionalRequirements: {
      type: [String],
      default: [],
    },
    evaluationRubric: [
      {
        criterion: { type: String, required: true },
        weight: { type: Number, default: 25 },
        description: { type: String, default: '' },
      },
    ],
    starterCode: {
      javascript: { type: String, required: true },
    },
    solutionCode: {
      javascript: { type: String, required: true },
    },
    testCases: [featureTestCaseSchema],
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

const FeatureProject = mongoose.model('FeatureProject', featureProjectSchema);
export default FeatureProject;
