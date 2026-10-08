import express from 'express';
import {
  getAssessments,
  getAssessmentById,
  createAssessment,
  deleteAssessment,
  startAssessment,
  submitAssessment,
} from '../controllers/assessmentController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.route('/')
  .get(optionalAuth, getAssessments)
  .post(protect, authorize('instructor'), createAssessment);

router.route('/:id')
  .get(optionalAuth, getAssessmentById)
  .delete(protect, authorize('instructor'), deleteAssessment);

router.route('/:id/start')
  .post(protect, authorize('candidate', 'instructor', 'admin'), startAssessment);

router.route('/:id/submit')
  .post(protect, authorize('candidate', 'instructor', 'admin'), submitAssessment);

export default router;
