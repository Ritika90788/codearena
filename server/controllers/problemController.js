import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';

// @desc    Get all problems with filtering and pagination
// @route   GET /api/problems
// @access  Public (or Candidate/Instructor)
export const getProblems = async (req, res, next) => {
  try {
    const { difficulty, topic, search, page = 1, limit = 20 } = req.query;

    const query = { isPublished: true };

    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }

    if (topic && topic !== 'All') {
      query.topic = topic;
    }

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const [problems, total] = await Promise.all([
      Problem.find(query)
        .select('-solution')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      Problem.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: problems.length,
      total,
      totalPages: Math.ceil(total / parseInt(limit)),
      currentPage: parseInt(page),
      problems,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single problem by ID or slug
// @route   GET /api/problems/:id
// @access  Public / Candidate / Instructor
export const getProblemById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let problem;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      problem = await Problem.findById(id);
    } else {
      problem = await Problem.findOne({ slug: id });
    }

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    // Role-based test case exposure:
    // If instructor, return both public and hidden test cases.
    // If candidate or unauthenticated, return ONLY public test cases!
    const isInstructor = req.user?.role === 'instructor';
    const testCasesFilter = { problemId: problem._id };
    if (!isInstructor) {
      testCasesFilter.isHidden = false;
    }

    const testCases = await TestCase.find(testCasesFilter).sort({ order: 1 });

    res.status(200).json({
      success: true,
      problem,
      testCases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new problem
// @route   POST /api/problems
// @access  Private (Instructor only)
export const createProblem = async (req, res, next) => {
  try {
    const {
      title,
      description,
      difficulty,
      topic,
      constraints,
      inputFormat,
      outputFormat,
      examples,
      timeLimit,
      memoryLimit,
      starterCode,
      solution,
      testCases,
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: 'Title and description are required',
      });
    }

    const problem = await Problem.create({
      title,
      description,
      difficulty: difficulty || 'Medium',
      topic: topic || 'Arrays',
      constraints: constraints || [],
      inputFormat: inputFormat || '',
      outputFormat: outputFormat || '',
      examples: examples || [],
      timeLimit: timeLimit || 2000,
      memoryLimit: memoryLimit || 256,
      starterCode: starterCode || {
        javascript: 'function solution(input) {\n  // Write your code here\n}',
        python: 'def solution(input):\n    # Write your code here\n    pass',
      },
      solution: solution || '',
      createdBy: req.user._id,
    });

    // If initial test cases were provided, insert them
    if (Array.isArray(testCases) && testCases.length > 0) {
      const tcDocs = testCases.map((tc, idx) => ({
        problemId: problem._id,
        input: tc.input,
        expectedOutput: tc.expectedOutput,
        isHidden: !!tc.isHidden,
        explanation: tc.explanation || '',
        order: idx + 1,
      }));
      await TestCase.insertMany(tcDocs);
    }

    res.status(201).json({
      success: true,
      message: 'Problem created successfully',
      problem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update a problem
// @route   PUT /api/problems/:id
// @access  Private (Instructor only)
export const updateProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Problem updated successfully',
      problem,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a problem
// @route   DELETE /api/problems/:id
// @access  Private (Instructor only)
export const deleteProblem = async (req, res, next) => {
  try {
    const problem = await Problem.findById(req.params.id);
    if (!problem) {
      return res.status(404).json({
        success: false,
        message: 'Problem not found',
      });
    }

    await Promise.all([
      Problem.findByIdAndDelete(req.params.id),
      TestCase.deleteMany({ problemId: req.params.id }),
    ]);

    res.status(200).json({
      success: true,
      message: 'Problem and associated test cases deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get test cases for a problem
// @route   GET /api/problems/:id/testcases
// @access  Public/Private (Filters hidden cases unless instructor)
export const getProblemTestCases = async (req, res, next) => {
  try {
    const isInstructor = req.user?.role === 'instructor';
    const filter = { problemId: req.params.id };
    if (!isInstructor) {
      filter.isHidden = false;
    }

    const testCases = await TestCase.find(filter).sort({ order: 1 });

    res.status(200).json({
      success: true,
      testCases,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Add a test case to a problem
// @route   POST /api/problems/:id/testcases
// @access  Private (Instructor only)
export const addTestCase = async (req, res, next) => {
  try {
    const { input, expectedOutput, isHidden, explanation } = req.body;

    if (!input || expectedOutput === undefined) {
      return res.status(400).json({
        success: false,
        message: 'Input and expected output are required',
      });
    }

    const testCase = await TestCase.create({
      problemId: req.params.id,
      input,
      expectedOutput,
      isHidden: !!isHidden,
      explanation: explanation || '',
    });

    res.status(201).json({
      success: true,
      message: 'Test case added successfully',
      testCase,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a test case
// @route   DELETE /api/testcases/:id
// @access  Private (Instructor only)
export const deleteTestCase = async (req, res, next) => {
  try {
    const tc = await TestCase.findByIdAndDelete(req.params.id);
    if (!tc) {
      return res.status(404).json({
        success: false,
        message: 'Test case not found',
      });
    }

    res.status(200).json({
      success: true,
      message: 'Test case removed successfully',
    });
  } catch (error) {
    next(error);
  }
};
