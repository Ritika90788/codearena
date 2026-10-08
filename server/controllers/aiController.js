import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';
import {
  generateHint,
  reviewCode,
  explainProblem,
  generateTestCasesWithAI,
  generateInterviewQuestion,
  detectPlagiarismSignals,
  evaluateCodeExplanation,
} from '../services/geminiService.js';

// @desc    Get progressive hint (Level 1, 2, or 3)
// @route   POST /api/ai/hint
// @access  Private
export const getAiHint = async (req, res, next) => {
  try {
    const { problemId, code, level = 1 } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const hint = await generateHint({ problem, code, level });
    res.status(200).json({
      success: true,
      level,
      hint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Code Quality Review
// @route   POST /api/ai/review
// @access  Private
export const getAiCodeReview = async (req, res, next) => {
  try {
    const { problemId, code, language = 'javascript' } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const review = await reviewCode({ problem, code, language });
    res.status(200).json({
      success: true,
      review,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Plain-English Problem Explainer
// @route   POST /api/ai/explain
// @access  Private
export const getAiExplanation = async (req, res, next) => {
  try {
    const { problemId } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const explanation = await explainProblem({ problem });
    res.status(200).json({
      success: true,
      explanation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Generate Synthetic Test Cases for Instructor
// @route   POST /api/ai/generate-testcases
// @access  Private (Instructor only)
export const generateTestCases = async (req, res, next) => {
  try {
    const { problemId, count = 3 } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const testCases = await generateTestCasesWithAI({ problem, count });
    res.status(200).json({
      success: true,
      testCases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    AI Interview Interactive Step
// @route   POST /api/ai/interview
// @access  Private
export const conductInterviewStep = async (req, res, next) => {
  try {
    const { problemId, code, dialogueHistory = [], lastAnswer = '' } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const question = await generateInterviewQuestion({
      problem,
      code,
      dialogueHistory,
      lastAnswer,
    });

    res.status(200).json({
      success: true,
      question,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Compare Submissions for Plagiarism & Suspicious Signals
// @route   POST /api/ai/check-plagiarism
// @access  Private (Instructor only)
export const checkPlagiarism = async (req, res, next) => {
  try {
    const { submissionIdA, submissionIdB } = req.body;
    const [subA, subB] = await Promise.all([
      Submission.findById(submissionIdA).populate('candidateId', 'name email'),
      Submission.findById(submissionIdB).populate('candidateId', 'name email'),
    ]);

    if (!subA || !subB) {
      return res.status(404).json({ success: false, message: 'Submissions not found' });
    }

    const report = detectPlagiarismSignals(subA.code, subB.code);

    res.status(200).json({
      success: true,
      report: {
        ...report,
        submissionA: {
          id: subA._id,
          candidate: subA.candidateId.name,
          createdAt: subA.createdAt,
        },
        submissionB: {
          id: subB._id,
          candidate: subB.candidateId.name,
          createdAt: subB.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate Candidate's Code Explanation / Viva
// @route   POST /api/ai/evaluate-explanation
// @access  Private
export const evaluateExplanation = async (req, res, next) => {
  try {
    const { problemId, code, explanationText } = req.body;
    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, message: 'Problem not found' });
    }

    const evaluation = await evaluateCodeExplanation({
      problem,
      code,
      explanationText,
    });

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error) {
    next(error);
  }
};
