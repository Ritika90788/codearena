import Submission from '../models/Submission.js';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';
import ExecutionLog from '../models/ExecutionLog.js';
import { executeInSandbox } from '../services/sandboxRunner.js';
import submissionQueue from '../workers/submissionQueue.js';

// @desc    Run code ephemerally against public test cases or custom input
// @route   POST /api/submissions/run
// @access  Private (Candidate/Instructor)
export const runCode = async (req, res, next) => {
  try {
    const problemId = req.body.problemId || req.params.id;
    const { code, language = 'javascript', customInput } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID and code are required',
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    let testCasesToRun = [];

    if (customInput !== undefined && customInput !== null && customInput.trim() !== '') {
      testCasesToRun = [
        {
          input: customInput.trim(),
          expectedOutput: '',
          isHidden: false,
        },
      ];
    } else {
      // Retrieve ONLY public test cases for test run
      testCasesToRun = await TestCase.find({
        problemId: problem._id,
        isHidden: false,
      }).sort({ order: 1 });
    }

    if (testCasesToRun.length === 0) {
      // Fallback to problem example if no test cases created yet
      if (problem.examples && problem.examples.length > 0) {
        testCasesToRun = [
          {
            input: problem.examples[0].input,
            expectedOutput: problem.examples[0].output,
            isHidden: false,
          },
        ];
      }
    }

    const result = await executeInSandbox({
      code,
      language,
      testCases: testCasesToRun,
      timeLimitMs: problem.timeLimit || 2000,
      memoryLimitMB: problem.memoryLimit || 256,
    });

    const testList = result.results || [];
    const passedCount = testList.filter((r) => r.passed).length;

    res.status(200).json({
      success: true,
      verdict: result.verdict,
      results: testList,
      testResults: testList,
      testsPassed: passedCount,
      totalTests: testList.length,
      totalExecutionTime: result.totalExecutionTime || 0,
      executionTime: result.totalExecutionTime || 0,
      memoryUsage: result.memoryUsage || 0,
      consoleLogs: result.consoleLogs || [],
      compileError: result.compileError || '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit code for full grading against all (public + hidden) test cases
// @route   POST /api/submissions
// @access  Private (Candidate only)
export const submitCode = async (req, res, next) => {
  try {
    const { problemId, assessmentId, code, language = 'javascript' } = req.body;

    if (!problemId || !code) {
      return res.status(400).json({
        success: false,
        message: 'Problem ID and code are required',
      });
    }

    const problem = await Problem.findById(problemId);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // 1. Create initial Submission record in queued status
    const submission = await Submission.create({
      candidateId: req.user._id,
      problemId: problem._id,
      assessmentId: assessmentId || null,
      code,
      language,
      status: 'queued',
      verdict: 'Pending',
    });

    // 2. Add to worker queue for isolated sandbox execution
    await submissionQueue.add(submission._id);

    // 3. Poll for brief completion to return immediate results for candidate UI
    const maxWaitMs = 8000;
    const pollInterval = 150;
    let waited = 0;
    let finishedSubmission = null;

    while (waited < maxWaitMs) {
      await new Promise((r) => setTimeout(r, pollInterval));
      waited += pollInterval;

      const current = await Submission.findById(submission._id);
      if (current && (current.status === 'completed' || current.status === 'failed')) {
        finishedSubmission = current;
        break;
      }
    }

    const finalSub = finishedSubmission || (await Submission.findById(submission._id));

    // Return masked candidate JSON (never revealing hidden test case payloads)
    res.status(201).json({
      success: true,
      message: 'Submission evaluated',
      submission: finalSub.toCandidateJSON(),
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single submission details
// @route   GET /api/submissions/:id
// @access  Private
export const getSubmissionById = async (req, res, next) => {
  try {
    const submission = await Submission.findById(req.params.id)
      .populate('problemId', 'title slug difficulty topic timeLimit memoryLimit')
      .populate('candidateId', 'name email avatar');

    if (!submission) {
      return res.status(404).json({
        success: false,
        message: 'Submission not found',
      });
    }

    const isInstructor = req.user.role === 'instructor';
    const isOwner = submission.candidateId._id.toString() === req.user._id.toString();

    if (!isInstructor && !isOwner) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this submission',
      });
    }

    // If candidate, mask hidden test case specifics
    const responseData = isInstructor ? submission.toObject() : submission.toCandidateJSON();

    // If instructor, also attach execution log
    if (isInstructor) {
      const log = await ExecutionLog.findOne({ submissionId: submission._id });
      responseData.executionLog = log;
    }

    res.status(200).json({
      success: true,
      submission: responseData,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past submissions
// @route   GET /api/submissions/my
// @access  Private
export const getMySubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({ candidateId: req.user._id })
      .populate('problemId', 'title difficulty topic')
      .sort({ createdAt: -1 })
      .limit(50);

    const safeList = submissions.map((s) => s.toCandidateJSON());

    res.status(200).json({
      success: true,
      count: safeList.length,
      submissions: safeList,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all submissions across candidates (for instructor console)
// @route   GET /api/submissions
// @access  Private (Instructor only)
export const getAllSubmissions = async (req, res, next) => {
  try {
    const submissions = await Submission.find({})
      .populate('problemId', 'title difficulty topic')
      .populate('candidateId', 'name email avatar')
      .populate('assessmentId', 'title')
      .sort({ createdAt: -1 })
      .limit(100);

    res.status(200).json({
      success: true,
      count: submissions.length,
      submissions,
    });
  } catch (error) {
    next(error);
  }
};

