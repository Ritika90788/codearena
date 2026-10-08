import express from 'express';
import {
  getDebugChallenges,
  getDebugChallengeById,
  getDebugHint,
  runDebugCode,
  submitDebugCode,
  explainDebugFix,
} from '../controllers/debugController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getDebugChallenges);
router.get('/:id', optionalAuth, getDebugChallengeById);
router.post('/:id/hint', optionalAuth, getDebugHint);
router.post('/:id/run', optionalAuth, runDebugCode);
router.post('/:id/submit', optionalAuth, submitDebugCode);
router.post('/:id/explain-fix', optionalAuth, explainDebugFix);

export default router;
