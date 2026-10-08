import express from 'express';
import {
  getFeatureProjects,
  getFeatureProjectById,
  runFeatureCode,
  submitFeatureCode,
} from '../controllers/featureController.js';
import { protect, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.get('/', optionalAuth, getFeatureProjects);
router.get('/:id', optionalAuth, getFeatureProjectById);
router.post('/:id/run', optionalAuth, runFeatureCode);
router.post('/:id/submit', optionalAuth, submitFeatureCode);

export default router;
