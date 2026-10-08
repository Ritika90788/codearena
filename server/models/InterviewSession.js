import mongoose from 'mongoose';

const interviewMessageSchema = new mongoose.Schema({
  round: {
    type: Number,
    required: true,
  },
  roundName: {
    type: String,
    required: true,
  },
  interviewerQuestion: {
    type: String,
    required: true,
  },
  candidateAnswer: {
    type: String,
    default: '',
  },
  candidateCode: {
    type: String,
    default: '',
  },
  evaluation: {
    type: String,
    default: '',
  },
  roundScore: {
    type: Number,
    default: 0,
  },
  feedback: {
    type: String,
    default: '',
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
});

const interviewSessionSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    jobRole: {
      type: String,
      required: true,
      enum: [
        'Frontend Developer',
        'Backend Developer',
        'Full Stack Developer',
        'JavaScript Developer',
        'React Developer',
        'Node.js Developer',
      ],
      default: 'Full Stack Developer',
    },
    experienceLevel: {
      type: String,
      required: true,
      enum: ['Junior (0-2 yrs)', 'Mid-Level (2-5 yrs)', 'Senior (5+ yrs)'],
      default: 'Junior (0-2 yrs)',
    },
    preferredTech: {
      type: String,
      default: 'JavaScript, React, Node.js',
    },
    difficulty: {
      type: String,
      enum: ['Standard', 'Rigorous', 'FAANG-level'],
      default: 'Standard',
    },
    status: {
      type: String,
      enum: ['in_progress', 'completed', 'abandoned'],
      default: 'in_progress',
      index: true,
    },
    currentRound: {
      type: Number,
      default: 1, // 1 to 6
    },
    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Problem',
      required: true,
    },
    codingSolution: {
      code: { type: String, default: '' },
      language: { type: String, default: 'javascript' },
      verdict: { type: String, default: '' },
      testsPassed: { type: Number, default: 0 },
      totalTests: { type: Number, default: 0 },
    },
    transcript: [interviewMessageSchema],
    scores: {
      codingAbility: { type: Number, default: 0 },
      problemSolving: { type: Number, default: 0 },
      debugging: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      technicalKnowledge: { type: Number, default: 0 },
      complexityKnowledge: { type: Number, default: 0 },
      codeQuality: { type: Number, default: 0 },
      decisionMaking: { type: Number, default: 0 },
      overallScore: { type: Number, default: 0 },
      interviewReadiness: { type: Number, default: 0 },
    },
    report: {
      strengths: { type: [String], default: [] },
      weakAreas: { type: [String], default: [] },
      feedbackSummary: { type: String, default: '' },
      recommendedTopics: { type: [String], default: [] },
      practicePlan: { type: [String], default: [] },
    },
    voiceConfig: {
      audioAvailable: { type: Boolean, default: true },
      transcriptionUsed: { type: Boolean, default: false },
    },
  },
  {
    timestamps: true,
  }
);

const InterviewSession = mongoose.model('InterviewSession', interviewSessionSchema);
export default InterviewSession;
