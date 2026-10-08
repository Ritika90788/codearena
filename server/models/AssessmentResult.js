import mongoose from 'mongoose';

const assessmentResultSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    assessmentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Assessment',
    },
    simulationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Simulation',
    },
    title: {
      type: String,
      required: true,
    },
    score: {
      type: Number,
      required: true,
    },
    maxScore: {
      type: Number,
      default: 100,
    },
    percentage: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['Needs Preparation', 'Improving', 'Almost Ready', 'Interview Ready'],
      default: 'Improving',
    },
    breakdown: {
      coding: { type: Number, default: 0 },
      debugging: { type: Number, default: 0 },
      systemThinking: { type: Number, default: 0 },
      communication: { type: Number, default: 0 },
      adaptability: { type: Number, default: 0 },
    },
    feedback: {
      type: String,
      default: '',
    },
    completedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const AssessmentResult = mongoose.model('AssessmentResult', assessmentResultSchema);
export default AssessmentResult;
