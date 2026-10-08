import express from 'express';
import {
  getAiHint,
  getAiCodeReview,
  getAiExplanation,
  generateTestCases,
  conductInterviewStep,
  checkPlagiarism,
  evaluateExplanation,
} from '../controllers/aiController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

router.post('/hint', protect, getAiHint);
router.post('/review', protect, getAiCodeReview);
router.post('/explain', protect, getAiExplanation);
router.post('/interview', protect, conductInterviewStep);
router.post('/evaluate-explanation', protect, evaluateExplanation);

// Instructor-only AI endpoints
router.post('/generate-testcases', protect, authorize('instructor'), generateTestCases);
router.post('/check-plagiarism', protect, authorize('instructor'), checkPlagiarism);

export default router;
