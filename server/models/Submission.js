import mongoose from 'mongoose';

const testResultSchema = new mongoose.Schema({
  testCaseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'TestCase',
  },
  testIndex: Number,
  passed: Boolean,
  status: {
    type: String,
    enum: ['Accepted', 'Wrong Answer', 'Time Limit Exceeded', 'Memory Limit Exceeded', 'Runtime Error'],
    default: 'Wrong Answer',
  },
  executionTime: Number, // in ms
  memoryUsage: Number,   // in MB
  input: String,
  expectedOutput: String,
  actualOutput: String,
  error: String,
  isHidden: Boolean,
});

const submissionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      default: null,
      index: true,
    },
    code: {
      type: String,
      required: true,
    },
    language: {
      type: String,
      enum: ['javascript', 'python', 'java', 'cpp', 'c'],
      default: 'javascript',
    },
    status: {
      type: String,
      enum: ['pending', 'queued', 'running', 'completed', 'failed'],
      default: 'pending',
      index: true,
    },
    verdict: {
      type: String,
      enum: [
        'Pending',
        'Accepted',
        'Wrong Answer',
        'Time Limit Exceeded',
        'Memory Limit Exceeded',
        'Runtime Error',
        'Compilation Error',
      ],
      default: 'Pending',
      index: true,
    },
    testsPassed: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    score: {
      type: Number,
      default: 0,
    },
    executionTime: {
      type: Number,
      default: 0, // ms
    },
    memoryUsage: {
      type: Number,
      default: 0, // MB
    },
    error: {
      type: String,
      default: '',
    },
    testResults: [testResultSchema],
  },
  {
    timestamps: true,
  }
);

// Method to mask hidden test cases details when sending response to candidate
submissionSchema.methods.toCandidateJSON = function () {
  const obj = this.toObject();
  if (Array.isArray(obj.testResults)) {
    obj.testResults = obj.testResults.map((tr) => {
      if (tr.isHidden) {
        return {
          testIndex: tr.testIndex,
          passed: tr.passed,
          status: tr.status,
          executionTime: tr.executionTime,
          isHidden: true,
          // Hide actual input and expected/actual output for hidden tests!
          input: '[Hidden Test Case]',
          expectedOutput: '[Hidden Test Case]',
          actualOutput: '[Hidden Test Case]',
          error: tr.passed ? '' : 'Failed hidden test case assertion',
        };
      }
      return tr;
    });
  }
  return obj;
};

const Submission = mongoose.model('Submission', submissionSchema);
export default Submission;
