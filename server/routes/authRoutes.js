import express from 'express';
import {
  register,
  login,
  getMe,
  updateProfile,
  logout,
  switchRole,
  getCandidates,
  candidateEntry,
} from '../controllers/authController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/candidate-entry', candidateEntry);
router.post('/logout', logout);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.post('/switch-role', protect, switchRole);
router.get('/candidates', protect, authorize('instructor'), getCandidates);

export default router;
