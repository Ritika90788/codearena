import Mission from '../models/Mission.js';
import ThinkingProfile from '../models/ThinkingProfile.js';
import { executeInSandbox } from '../services/sandboxRunner.js';
import { generateMissionArchitectureReview } from '../services/geminiService.js';

// @desc    Get all missions with domain / difficulty filtering
// @route   GET /api/missions
// @access  Public / Private
export const getMissions = async (req, res, next) => {
  try {
    const { domain, difficulty, search } = req.query;
    const query = { isPublished: true };

    if (domain && domain !== 'All') {
      query.domain = domain;
    }
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { companyScenario: { $regex: search, $options: 'i' } },
        { businessProblem: { $regex: search, $options: 'i' } },
      ];
    }

    const missions = await Mission.find(query)
      .select('-solutionCode -testCases')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: missions.length,
      missions,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single mission by ID or slug
// @route   GET /api/missions/:id
// @access  Public / Private
export const getMissionById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let mission = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      mission = await Mission.findById(id).select('-solutionCode');
    } else {
      mission = await Mission.findOne({ slug: id }).select('-solutionCode');
    }

    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }

    // Filter test cases: reveal only public test cases
    const isInstructor = req.user?.role === 'instructor';
    let safeTestCases = mission.testCases;
    if (!isInstructor) {
      safeTestCases = mission.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({
          _id: tc._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
        }));
    }

    const missionObj = mission.toObject();
    missionObj.testCases = safeTestCases;

    res.status(200).json({
      success: true,
      mission: missionObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run mission code against public test cases
// @route   POST /api/missions/:id/run
// @access  Private
export const runMissionCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }

    const publicTestCases = mission.testCases.filter((tc) => !tc.isHidden);

    const result = await executeInSandbox({
      code,
      language,
      testCases: publicTestCases,
      timeLimitMs: 3000,
      memoryLimitMB: 256,
    });

    res.status(200).json({
      success: true,
      verdict: result.verdict,
      results: result.results || [],
      totalExecutionTime: result.totalExecutionTime || 0,
      memoryUsage: result.memoryUsage || 0,
      consoleLogs: result.consoleLogs || [],
      compileError: result.compileError || '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit mission code against all (public + hidden) test cases and get AI Architecture Review
// @route   POST /api/missions/:id/submit
// @access  Private
export const submitMissionCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const mission = await Mission.findById(req.params.id);

    if (!mission) {
      return res.status(404).json({ success: false, message: 'Mission not found' });
    }

    // Run against ALL test cases
    const result = await executeInSandbox({
      code,
      language,
      testCases: mission.testCases,
      timeLimitMs: 4000,
      memoryLimitMB: 256,
    });

    const passedCount = result.results?.filter((r) => r.passed).length || 0;
    const totalCount = mission.testCases.length;
    const allPassed = passedCount === totalCount && result.verdict === 'Accepted';

    if (allPassed) {
      await Mission.findByIdAndUpdate(mission._id, { $inc: { completionsCount: 1 } });

      if (req.user?._id) {
        try {
          const profile = await ThinkingProfile.findOne({ candidateId: req.user._id });
          if (profile && profile.metrics) {
            profile.metrics.problemSolving = Math.min(99, (profile.metrics.problemSolving || 90) + 1);
            profile.metrics.systemThinking = Math.min(99, (profile.metrics.systemThinking || 80) + 2);
            profile.metrics.edgeCaseAwareness = Math.min(99, (profile.metrics.edgeCaseAwareness || 85) + 1);
            profile.metrics.codeQuality = Math.min(99, (profile.metrics.codeQuality || 88) + 1);

            const mVals = Object.values(profile.metrics).filter(v => typeof v === 'number');
            if (mVals.length > 0) {
              profile.overallReadiness = Math.round(mVals.reduce((a, b) => a + b, 0) / mVals.length);
            }
            await profile.save();
          }
        } catch (e) {
          console.error('Failed to update thinking profile after mission:', e.message);
        }
      }
    }

    // Generate AI Architecture Review
    const review = await generateMissionArchitectureReview({
      mission,
      code,
      verdict: result.verdict,
      allPassed,
      executionTime: result.totalExecutionTime,
      memoryUsage: result.memoryUsage,
    });

    res.status(200).json({
      success: true,
      verdict: result.verdict,
      allPassed,
      passedCount,
      totalCount,
      totalExecutionTime: result.totalExecutionTime,
      memoryUsage: result.memoryUsage,
      compileError: result.compileError,
      results: result.results?.map((r, i) => ({
        passed: r.passed,
        executionTime: r.executionTime,
        isHidden: mission.testCases[i]?.isHidden || false,
        error: r.error,
      })),
      review,
    });
  } catch (error) {
    next(error);
  }
};
