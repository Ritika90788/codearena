import User from '../models/User.js';
import Submission from '../models/Submission.js';
import AssessmentCandidate from '../models/AssessmentCandidate.js';
import { generateToken, setAuthCookie } from '../utils/generateToken.js';

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role, skills, bio } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide name, email, and password',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'An account with this email address already exists',
      });
    }

    // Role validation: only 'candidate' or 'instructor'
    const assignedRole = role === 'instructor' ? 'instructor' : 'candidate';

    // Default avatar based on name initials or dicebear
    const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(name)}`;

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: assignedRole,
      avatar,
      bio: bio || (assignedRole === 'instructor' ? 'Technical Instructor & Problem Author' : 'Software Engineer & Problem Solver'),
      skills: Array.isArray(skills) && skills.length > 0 ? skills : ['Arrays', 'Strings', 'JavaScript'],
    });

    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully',
      token,
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide an email and password',
      });
    }

    // Find user by email, explicitly including password field
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    // Compare password
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password',
      });
    }

    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    const distinctAccepted = await Submission.distinct('problemId', {
      candidateId: user._id,
      verdict: 'Accepted',
    });
    const completedAssessments = await AssessmentCandidate.countDocuments({
      candidateId: user._id,
      status: 'completed',
    });

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const weeklyAccepted = await Submission.distinct('problemId', {
      candidateId: user._id,
      verdict: 'Accepted',
      createdAt: { $gte: startOfWeek },
    });

    const userObj = user.toJSON();
    userObj.problemsSolved = distinctAccepted.length;
    userObj.assessmentsCompleted = completedAssessments;
    userObj.streak = distinctAccepted.length === 0 ? 0 : Math.max(1, user.streak || 1);
    userObj.xp = (distinctAccepted.length * 50) + (completedAssessments * 100);
    userObj.level = Math.max(1, Math.floor(distinctAccepted.length / 3) + 1);
    userObj.levelName = distinctAccepted.length >= 15 ? 'Master' : distinctAccepted.length >= 10 ? 'Expert' : distinctAccepted.length >= 5 ? 'Explorer' : distinctAccepted.length >= 1 ? 'Apprentice' : 'Beginner';
    userObj.weeklySolved = weeklyAccepted.length;
    userObj.weeklyTarget = 5;

    res.status(200).json({
      success: true,
      message: 'Logged in successfully',
      token,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    const distinctAccepted = await Submission.distinct('problemId', {
      candidateId: user._id,
      verdict: 'Accepted',
    });
    const completedAssessments = await AssessmentCandidate.countDocuments({
      candidateId: user._id,
      status: 'completed',
    });

    const startOfWeek = new Date();
    startOfWeek.setHours(0, 0, 0, 0);
    startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());

    const weeklyAccepted = await Submission.distinct('problemId', {
      candidateId: user._id,
      verdict: 'Accepted',
      createdAt: { $gte: startOfWeek },
    });

    const userObj = user.toJSON();
    userObj.problemsSolved = distinctAccepted.length;
    userObj.assessmentsCompleted = completedAssessments;
    userObj.streak = distinctAccepted.length === 0 ? 0 : Math.max(1, user.streak || 1);
    userObj.xp = (distinctAccepted.length * 50) + (completedAssessments * 100);
    userObj.level = Math.max(1, Math.floor(distinctAccepted.length / 3) + 1);
    userObj.levelName = distinctAccepted.length >= 15 ? 'Master' : distinctAccepted.length >= 10 ? 'Expert' : distinctAccepted.length >= 5 ? 'Explorer' : distinctAccepted.length >= 1 ? 'Apprentice' : 'Beginner';
    userObj.weeklySolved = weeklyAccepted.length;
    userObj.weeklyTarget = 5;

    res.status(200).json({
      success: true,
      user: userObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user profile
// @route   PUT /api/auth/profile
// @access  Private
export const updateProfile = async (req, res, next) => {
  try {
    const { name, bio, skills, githubHandle, linkedinHandle, avatar } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found',
      });
    }

    if (name) user.name = name.trim();
    if (bio !== undefined) user.bio = bio;
    if (Array.isArray(skills)) user.skills = skills;
    if (githubHandle !== undefined) user.githubHandle = githubHandle;
    if (linkedinHandle !== undefined) user.linkedinHandle = linkedinHandle;
    if (avatar) user.avatar = avatar;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
      user,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Logout user / clear cookie
// @route   POST /api/auth/logout
// @access  Private
export const logout = async (req, res) => {
  res.cookie('token', '', {
    httpOnly: true,
    expires: new Date(0),
  });

  res.status(200).json({
    success: true,
    message: 'Logged out successfully',
  });
};

// @desc    Switch user role between candidate and instructor (instant testing toggle)
// @route   POST /api/auth/switch-role
// @access  Private
export const switchRole = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    user.role = user.role === 'instructor' ? 'candidate' : 'instructor';
    await user.save();
    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);
    res.status(200).json({
      success: true,
      message: `Role switched to ${user.role}`,
      user,
      token,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all registered candidates (for instructor console)
// @route   GET /api/auth/candidates
// @access  Private (Instructor only)
export const getCandidates = async (req, res, next) => {
  try {
    const candidates = await User.find({ role: 'candidate' })
      .select('name email avatar role createdAt problemsSolved assessmentsCompleted rating bio githubHandle')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: candidates.length,
      candidates,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Candidate Entry (Frictionless Intake for Assessment Links)
// @route   POST /api/auth/candidate-entry
// @access  Public
export const candidateEntry = async (req, res, next) => {
  try {
    const { name, email } = req.body;

    if (!name || !email) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both your name and email to proceed.',
      });
    }

    const cleanEmail = email.toLowerCase().trim();
    const cleanName = name.trim();

    let user = await User.findOne({ email: cleanEmail });
    if (!user) {
      const avatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${encodeURIComponent(cleanName)}`;
      const randomPassword = 'cand_' + Math.random().toString(36).substring(2, 10) + 'A1!';
      user = await User.create({
        name: cleanName,
        email: cleanEmail,
        password: randomPassword,
        role: 'candidate',
        avatar,
        bio: 'Assessment Candidate',
        skills: ['JavaScript', 'Algorithms', 'Problem Solving'],
      });
    }

    const token = generateToken(user._id, user.role);
    setAuthCookie(res, token);

    res.status(200).json({
      success: true,
      message: 'Candidate session verified successfully',
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    next(error);
  }
};

