import express from 'express';
import {
  getProblems,
  getProblemById,
  createProblem,
  updateProblem,
  deleteProblem,
  getProblemTestCases,
  addTestCase,
  deleteTestCase,
} from '../controllers/problemController.js';
import { runCode } from '../controllers/submissionController.js';
import { protect, authorize, optionalAuth } from '../middleware/auth.js';

const router = express.Router();

router.post('/:id/run', protect, (req, res, next) => {
  req.body.problemId = req.params.id;
  runCode(req, res, next);
});

router.route('/')
  .get(optionalAuth, getProblems)
  .post(protect, authorize('instructor'), createProblem);

router.route('/:id')
  .get(optionalAuth, getProblemById)
  .put(protect, authorize('instructor'), updateProblem)
  .delete(protect, authorize('instructor'), deleteProblem);

router.route('/:id/testcases')
  .get(optionalAuth, getProblemTestCases)
  .post(protect, authorize('instructor'), addTestCase);

router.route('/testcases/:id')
  .delete(protect, authorize('instructor'), deleteTestCase);

export default router;
