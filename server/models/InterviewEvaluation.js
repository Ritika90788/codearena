import mongoose from 'mongoose';

const interviewEvaluationSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      index: true,
    },
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    round: {
      type: Number,
      required: true,
    },
    roundName: {
      type: String,
      required: true,
    },
    question: {
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
    score: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    consistencyScore: {
      type: Number,
      default: 85,
    },
    consistencyFeedback: {
      type: String,
      default: 'Candidate explanation matches code implementation accurately.',
    },
    geminiFeedback: {
      type: String,
      default: '',
    },
    strengths: [String],
    weaknesses: [String],
  },
  {
    timestamps: true,
  }
);

const InterviewEvaluation = mongoose.model('InterviewEvaluation', interviewEvaluationSchema);
export default InterviewEvaluation;
