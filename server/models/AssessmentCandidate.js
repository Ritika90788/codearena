import mongoose from 'mongoose';

const problemScoreSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  score: {
    type: Number,
    default: 0,
  },
  solved: {
    type: Boolean,
    default: false,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  lastCode: {
    type: String,
    default: '',
  },
});

const assessmentCandidateSchema = new mongoose.Schema(
  {
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['not_started', 'in_progress', 'completed', 'expired'],
      default: 'not_started',
      index: true,
    },
    startedAt: {
      type: Date,
      default: null,
    },
    expiresAt: {
      type: Date,
      default: null,
    },
    submittedAt: {
      type: Date,
      default: null,
    },
    score: {
      type: Number,
      default: 0,
    },
    totalScore: {
      type: Number,
      default: 100,
    },
    problemScores: [problemScoreSchema],
    adaptiveHistory: [
      {
        problemId: { type: mongoose.Schema.Types.ObjectId, ref: 'Problem' },
        difficulty: String,
        correct: Boolean,
        timestamp: { type: Date, default: Date.now },
      },
    ],
  },
  {
    timestamps: true,
  }
);

// Compound index so a candidate can only have one assessment record per assessment
assessmentCandidateSchema.index({ assessmentId: 1, candidateId: 1 }, { unique: true });

const AssessmentCandidate = mongoose.model('AssessmentCandidate', assessmentCandidateSchema);
export default AssessmentCandidate;
