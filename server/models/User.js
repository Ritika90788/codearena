import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide a name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    email: {
      type: String,
      required: [true, 'Please provide an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,})+$/,
        'Please provide a valid email address',
      ],
    },
    password: {
      type: String,
      required: [true, 'Please provide a password'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false,
    },
    role: {
      type: String,
      enum: ['candidate', 'instructor'],
      default: 'candidate',
    },
    avatar: {
      type: String,
      default: '',
    },
    bio: {
      type: String,
      default: 'Passionate developer ready for challenges.',
      maxlength: [200, 'Bio cannot exceed 200 characters'],
    },
    skills: {
      type: [String],
      default: ['Arrays', 'Strings', 'JavaScript'],
    },
    rating: {
      type: Number,
      default: 1200,
    },
    streak: {
      type: Number,
      default: 0,
    },
    problemsSolved: {
      type: Number,
      default: 0,
    },
    assessmentsCompleted: {
      type: Number,
      default: 0,
    },
    averageScore: {
      type: Number,
      default: 0,
    },
    githubHandle: {
      type: String,
      default: '',
    },
    linkedinHandle: {
      type: String,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) {
    return next();
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare entered password with hashed password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Safe JSON serialization
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  return obj;
};

const User = mongoose.model('User', userSchema);
export default User;
