import express from 'express';
import {
  runCode,
  submitCode,
  getSubmissionById,
  getMySubmissions,
  getAllSubmissions,
} from '../controllers/submissionController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.get('/', protect, authorize('instructor'), getAllSubmissions);
router.post('/run', runCode);
router.post('/', protect, submitCode);
router.get('/my', protect, getMySubmissions);
router.get('/:id', protect, getSubmissionById);

export default router;
