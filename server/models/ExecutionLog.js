import mongoose from 'mongoose';

const executionLogSchema = new mongoose.Schema(
  {
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    compileStatus: {
      type: String,
      default: 'SUCCESS',
    },
    executionStatus: {
      type: String,
      default: 'COMPLETED',
    },
    executionTimeMs: {
      type: Number,
      default: 0,
    },
    memoryUsageMB: {
      type: Number,
      default: 0,
    },
    testsPassed: {
      type: Number,
      default: 0,
    },
    totalTests: {
      type: Number,
      default: 0,
    },
    systemLogs: {
      type: String,
      default: '',
    },
    workerId: {
      type: String,
      default: 'worker-node-1',
    },
  },
  {
    timestamps: true,
  }
);

const ExecutionLog = mongoose.model('ExecutionLog', executionLogSchema);
export default ExecutionLog;
