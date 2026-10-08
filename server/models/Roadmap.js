import mongoose from 'mongoose';

const roadmapDaySchema = new mongoose.Schema({
  dayNumber: { type: Number, required: true },
  topic: { type: String, required: true },
  description: { type: String, required: true },
  challengeType: { type: String, default: 'Mission' },
  actionUrl: { type: String, default: '/missions' },
  status: {
    type: String,
    enum: ['completed', 'current', 'locked'],
    default: 'locked',
  },
});

const roadmapSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    title: {
      type: String,
      default: '7-Day Engineering Readiness Acceleration',
    },
    weakAreas: {
      type: [String],
      default: ['Database Optimization', 'System Design', 'Communication'],
    },
    days: [roadmapDaySchema],
  },
  {
    timestamps: true,
  }
);

const Roadmap = mongoose.model('Roadmap', roadmapSchema);
export default Roadmap;
