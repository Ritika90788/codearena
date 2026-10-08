import mongoose from 'mongoose';

const interviewMessageSchema = new mongoose.Schema(
  {
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'InterviewSession',
      required: true,
      index: true,
    },
    sender: {
      type: String,
      enum: ['ai', 'candidate', 'system'],
      required: true,
    },
    round: {
      type: Number,
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    codeSnippet: {
      type: String,
      default: '',
    },
    audioUrl: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

const InterviewMessage = mongoose.model('InterviewMessage', interviewMessageSchema);
export default InterviewMessage;
