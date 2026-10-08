import express from 'express';
import {
  getMissions,
  getMissionById,
  runMissionCode,
  submitMissionCode,
} from '../controllers/missionController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getMissions);
router.get('/:id', optionalAuth, getMissionById);
router.post('/:id/run', optionalAuth, runMissionCode);
router.post('/:id/submit', optionalAuth, submitMissionCode);

export default router;
