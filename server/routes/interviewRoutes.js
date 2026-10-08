import express from 'express';
import {
  startInterview,
  stepInterview,
  getInterviewById,
  getMyInterviews,
} from '../controllers/interviewController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.post('/start', protect, startInterview);
router.post('/:id/step', protect, stepInterview);
router.get('/my', protect, getMyInterviews);
router.get('/:id', protect, getInterviewById);

export default router;
