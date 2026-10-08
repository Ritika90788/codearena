import express from 'express';
import {
  getThinkingProfile,
  getPersonalizedRoadmap,
  recordRecoveryEvent,
} from '../controllers/profileController.js';
import { optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/thinking', optionalAuth, getThinkingProfile);
router.get('/roadmap', optionalAuth, getPersonalizedRoadmap);
router.post('/record-recovery', optionalAuth, recordRecoveryEvent);

export default router;
