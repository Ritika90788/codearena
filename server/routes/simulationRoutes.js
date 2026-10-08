import express from 'express';
import {
  getCurrentSimulation,
  getSimulationById,
  updateSimulationTask,
  resolveSimulationIncident,
  runBenchmark,
  advanceRequirementStage,
  saveVirtualFile,
  evaluateExplanation,
} from '../controllers/simulationController.js';
import { optionalAuth, protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/current', optionalAuth, getCurrentSimulation);
router.get('/:id', optionalAuth, getSimulationById);
router.put('/:id/task/:taskId', optionalAuth, updateSimulationTask);
router.post('/:id/incident/:incidentId/resolve', optionalAuth, resolveSimulationIncident);
router.post('/:id/benchmark', optionalAuth, runBenchmark);
router.post('/:id/requirement/next', optionalAuth, advanceRequirementStage);
router.post('/:id/save-file', optionalAuth, saveVirtualFile);
router.post('/:id/explain', optionalAuth, evaluateExplanation);

export default router;
