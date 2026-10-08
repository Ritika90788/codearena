import mongoose from 'mongoose';

const taskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  priority: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'MEDIUM',
  },
  deadline: { type: String, default: 'End of Sprint' },
  status: {
    type: String,
    enum: ['completed', 'in_progress', 'pending'],
    default: 'pending',
  },
  starterCode: { type: String, default: '' },
  solutionCode: { type: String, default: '' },
  instructions: { type: String, default: '' },
});

const incidentSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, default: '' },
  severity: {
    type: String,
    enum: ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'],
    default: 'CRITICAL',
  },
  normalResponseMs: { type: Number, default: 200 },
  currentResponseMs: { type: Number, default: 8400 },
  affectedUsers: { type: Number, default: 40281 },
  errorRate: { type: Number, default: 17 },
  dbLoad: { type: Number, default: 91 },
  rootCause: { type: String, default: 'Missing database index' },
  possibleCauses: {
    type: [String],
    default: [
      'Missing database index',
      'N+1 query',
      'Memory leak',
      'Bad API logic',
      'Infinite loop',
      'Inefficient algorithm',
      'Incorrect caching',
      'Connection issue',
      'Race condition',
    ],
  },
  logs: { type: [String], default: [] },
  metrics: { type: mongoose.Schema.Types.Mixed, default: {} },
  isResolved: { type: Boolean, default: false },
});

const requirementChangeSchema = new mongoose.Schema({
  step: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  status: {
    type: String,
    enum: ['completed', 'active', 'upcoming'],
    default: 'upcoming',
  },
});

const simulationSchema = new mongoose.Schema(
  {
    companyName: {
      type: String,
      required: true,
      default: 'NovaCart',
    },
    role: {
      type: String,
      required: true,
      default: 'Junior Full Stack Developer',
    },
    sprintName: {
      type: String,
      required: true,
      default: 'Order Management System',
    },
    progress: {
      type: Number,
      default: 68,
      min: 0,
      max: 100,
    },
    systemHealth: {
      status: { type: String, default: 'Degraded' },
      uptime: { type: Number, default: 99.4 },
      errorRate: { type: Number, default: 17 },
      avgLatencyMs: { type: Number, default: 8400 },
      dbLoad: { type: Number, default: 91 },
    },
    tasks: [taskSchema],
    incidents: [incidentSchema],
    requirementChanges: [requirementChangeSchema],
    files: [
      {
        path: { type: String, required: true },
        name: { type: String, required: true },
        content: { type: String, default: '' },
        language: { type: String, default: 'javascript' },
      },
    ],
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    isPressureMode: {
      type: Boolean,
      default: false,
    },
    timeRemainingSec: {
      type: Number,
      default: 900, // 15 mins default pressure mode
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'paused'],
      default: 'in_progress',
    },
  },
  {
    timestamps: true,
  }
);

const Simulation = mongoose.model('Simulation', simulationSchema);
export default Simulation;
