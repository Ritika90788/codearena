import mongoose from 'mongoose';

const plagiarismSignalSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    submissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    },
    matchedSubmissionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Submission',
    },
    problemTitle: {
      type: String,
      default: '',
    },
    similarityScore: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    riskLevel: {
      type: String,
      enum: ['Low', 'Medium', 'High'],
      default: 'Medium',
    },
    signals: {
      type: [String],
      default: [
        'Normalized AST token sequence similarity',
        'Structural loop and variable renaming pattern',
      ],
    },
    status: {
      type: String,
      enum: ['Under Review', 'Dismissed', 'Confirmed'],
      default: 'Under Review',
    },
    disclaimer: {
      type: String,
      default: 'Suspicious Signal — Requires Instructor Review',
    },
    notes: {
      type: String,
      default: '',
    },
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    reviewedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

const PlagiarismSignal = mongoose.model('PlagiarismSignal', plagiarismSignalSchema);
export default PlagiarismSignal;
