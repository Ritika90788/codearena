import mongoose from 'mongoose';

const skillItemSchema = new mongoose.Schema({
  name: { type: String, required: true },
  category: { type: String, default: 'General' },
  score: { type: Number, default: 80 },
  solvedCount: { type: Number, default: 0 },
  level: { type: String, default: 'Intermediate' },
});

const skillProfileSchema = new mongoose.Schema(
  {
    candidateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    skills: [skillItemSchema],
  },
  {
    timestamps: true,
  }
);

const SkillProfile = mongoose.model('SkillProfile', skillProfileSchema);
export default SkillProfile;
