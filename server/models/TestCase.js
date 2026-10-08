import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema(
  {
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    input: {
      type: String,
      required: [true, 'Please provide input data for the test case'],
    },
    expectedOutput: {
      type: String,
      required: [true, 'Please provide expected output for the test case'],
    },
    isHidden: {
      type: Boolean,
      default: false,
      index: true,
    },
    explanation: {
      type: String,
      default: '',
    },
    timeLimit: {
      type: Number,
      default: 0, // 0 means inherit from problem
    },
    order: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const TestCase = mongoose.model('TestCase', testCaseSchema);
export default TestCase;
