import mongoose from 'mongoose';

const assessmentProblemSchema = new mongoose.Schema({
  problemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Problem',
    required: true,
  },
  points: {
    type: Number,
    default: 25,
  },
  order: {
    type: Number,
    default: 1,
  },
});

const assessmentSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide an assessment title'],
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    description: {
      type: String,
      required: [true, 'Please provide a detailed assessment description'],
    },
    instructions: {
      type: String,
      default: 'Read problem statements carefully. Ensure code runs within specified time and memory constraints. Copy-pasting external code is flagged for review.',
    },
    duration: {
      type: Number, // in minutes
      required: [true, 'Please specify duration in minutes'],
      default: 90,
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard', 'Mixed'],
      default: 'Medium',
    },
    problems: [assessmentProblemSchema],
    totalPoints: {
      type: Number,
      default: 100,
    },
    passingScore: {
      type: Number,
      default: 70,
    },
    status: {
      type: String,
      enum: ['Upcoming', 'Available', 'In Progress', 'Completed', 'Expired'],
      default: 'Available',
    },
    startTime: {
      type: Date,
      default: () => new Date(),
    },
    endTime: {
      type: Date,
      default: () => new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    },
    isAdaptive: {
      type: Boolean,
      default: false,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

const Assessment = mongoose.model('Assessment', assessmentSchema);
export default Assessment;
