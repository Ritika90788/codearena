import mongoose from 'mongoose';

const exampleSchema = new mongoose.Schema({
  input: { type: String, required: true },
  output: { type: String, required: true },
  explanation: { type: String, default: '' },
});

const problemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Please provide a problem title'],
      trim: true,
      maxlength: [120, 'Title cannot exceed 120 characters'],
    },
    slug: {
      type: String,
      unique: true,
      index: true,
    },
    description: {
      type: String,
      required: [true, 'Please provide a problem statement/description'],
    },
    difficulty: {
      type: String,
      enum: ['Easy', 'Medium', 'Hard'],
      default: 'Medium',
      index: true,
    },
    topic: {
      type: String,
      enum: [
        'Arrays',
        'Strings',
        'Linked Lists',
        'Stack',
        'Queue',
        'Trees',
        'Graphs',
        'DP',
        'Dynamic Programming',
        'Sorting',
        'Searching',
        'Greedy',
        'Hashing',
        'JavaScript',
      ],
      default: 'Arrays',
      index: true,
    },
    constraints: {
      type: [String],
      default: [],
    },
    inputFormat: {
      type: String,
      default: '',
    },
    outputFormat: {
      type: String,
      default: '',
    },
    examples: [exampleSchema],
    timeLimit: {
      type: Number,
      default: 2000, // 2000 ms
    },
    memoryLimit: {
      type: Number,
      default: 256, // 256 MB
    },
    starterCode: {
      javascript: {
        type: String,
        default: 'function solution(input) {\n  // Write your code here\n}',
      },
      python: {
        type: String,
        default: 'def solution(input):\n    # Write your code here\n    pass',
      },
      java: {
        type: String,
        default: 'public class Solution {\n    public static void main(String[] args) {\n        // Write your code here\n    }\n}',
      },
      cpp: {
        type: String,
        default: '#include <iostream>\n#include <vector>\nusing namespace std;\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      },
      c: {
        type: String,
        default: '#include <stdio.h>\n\nint main() {\n    // Write your code here\n    return 0;\n}',
      },
    },
    solution: {
      type: String,
      default: '',
      select: false, // Never expose to candidate
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    acceptanceRate: {
      type: Number,
      default: 72,
    },
    submissionsCount: {
      type: Number,
      default: 0,
    },
    acceptedCount: {
      type: Number,
      default: 0,
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

// Auto-generate slug before save
problemSchema.pre('save', function (next) {
  if (this.isModified('title') || !this.slug) {
    this.slug = this.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  next();
});

const Problem = mongoose.model('Problem', problemSchema);
export default Problem;
