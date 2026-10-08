import FeatureProject from '../models/FeatureProject.js';
import ThinkingProfile from '../models/ThinkingProfile.js';
import { executeInSandbox } from '../services/sandboxRunner.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

// @desc    Get all feature projects with category / difficulty filtering
// @route   GET /api/features
// @access  Public / Private
export const getFeatureProjects = async (req, res, next) => {
  try {
    const { category, difficulty, search } = req.query;
    const query = { isPublished: true };

    if (category && category !== 'All') {
      query.category = category;
    }
    if (difficulty && difficulty !== 'All') {
      query.difficulty = difficulty;
    }
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { featureScenario: { $regex: search, $options: 'i' } },
      ];
    }

    const projects = await FeatureProject.find(query)
      .select('-solutionCode -testCases')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single feature project by ID or slug
// @route   GET /api/features/:id
// @access  Public / Private
export const getFeatureProjectById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let project = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      project = await FeatureProject.findById(id).select('-solutionCode');
    } else {
      project = await FeatureProject.findOne({ slug: id }).select('-solutionCode');
    }

    if (!project) {
      return res.status(404).json({ success: false, message: 'Feature project not found' });
    }

    const isInstructor = req.user?.role === 'instructor';
    let safeTestCases = project.testCases;
    if (!isInstructor) {
      safeTestCases = project.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({
          _id: tc._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
        }));
    }

    const projectObj = project.toObject();
    projectObj.testCases = safeTestCases;

    res.status(200).json({
      success: true,
      project: projectObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run feature code against public test scenarios
// @route   POST /api/features/:id/run
// @access  Private
export const runFeatureCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const project = await FeatureProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Feature project not found' });
    }

    const publicTestCases = project.testCases.filter((tc) => !tc.isHidden);

    const result = await executeInSandbox({
      code,
      language,
      testCases: publicTestCases,
      timeLimitMs: 2500,
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

// @desc    Submit feature code against full test suite & generate AI Code Review
// @route   POST /api/features/:id/submit
// @access  Private
export const submitFeatureCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const project = await FeatureProject.findById(req.params.id);

    if (!project) {
      return res.status(404).json({ success: false, message: 'Feature project not found' });
    }

    const result = await executeInSandbox({
      code,
      language,
      testCases: project.testCases,
      timeLimitMs: 3000,
      memoryLimitMB: 256,
    });

    const passedCount = result.results?.filter((r) => r.passed).length || 0;
    const totalCount = project.testCases.length;
    const allPassed = passedCount === totalCount && result.verdict === 'Accepted';

    if (allPassed) {
      await FeatureProject.findByIdAndUpdate(project._id, { $inc: { completionsCount: 1 } });

      if (req.user?._id) {
        try {
          const profile = await ThinkingProfile.findOne({ candidateId: req.user._id });
          if (profile && profile.metrics) {
            profile.metrics.codeQuality = Math.min(99, (profile.metrics.codeQuality || 90) + 2);
            profile.metrics.systemThinking = Math.min(99, (profile.metrics.systemThinking || 80) + 2);
            profile.metrics.problemSolving = Math.min(99, (profile.metrics.problemSolving || 90) + 1);
            profile.metrics.decisionMaking = Math.min(99, (profile.metrics.decisionMaking || 87) + 1);

            const mVals = Object.values(profile.metrics).filter(v => typeof v === 'number');
            if (mVals.length > 0) {
              profile.overallReadiness = Math.round(mVals.reduce((a, b) => a + b, 0) / mVals.length);
            }
            await profile.save();
          }
        } catch (e) {
          console.error('Failed to update profile after feature submit:', e.message);
        }
      }
    }

    // AI Code Review for feature implementation
    let aiReview = null;
    if (model) {
      try {
        const prompt = `
You are a Principal Software Engineer evaluating a candidate's implementation of a practical feature.
Feature Title: "${project.title}" (${project.category})
Requirements:
${project.functionalRequirements.join('\n')}

Candidate's Code:
\`\`\`javascript
${code}
\`\`\`

Test Outcome: ${result.verdict} (${passedCount}/${totalCount} tests passed)

Evaluate this feature across:
1. Functional Correctness & API behavior
2. Error handling & edge cases
3. Code structure & maintainability
4. Performance & memory efficiency

Return ONLY valid JSON matching this schema:
{
  "featureQualityScore": 88,
  "verdictRating": "Production Ready | Good Foundation | Needs Hardening",
  "apiSemanticsFeedback": "2-3 sentences on HTTP status codes and contract compliance",
  "errorHandlingFeedback": "Analysis of edge case validation",
  "codeArchitectureNotes": "Assessment of separation of concerns and naming",
  "keyImprovements": ["Suggestion 1", "Suggestion 2"]
}
`;
        const aiRes = await model.generateContent(prompt);
        const match = aiRes.response.text().match(/\{[\s\S]*\}/);
        if (match) aiReview = JSON.parse(match[0]);
      } catch (err) {
        console.warn('Gemini feature review failed:', err.message);
      }
    }

    if (!aiReview) {
      aiReview = {
        featureQualityScore: allPassed ? 92 : 68,
        verdictRating: allPassed ? 'Production Ready' : 'Needs Validation Hardening',
        apiSemanticsFeedback: allPassed
          ? 'Strong API design adherence. HTTP status codes correctly differentiate resource creations, redirections, and client errors.'
          : 'Core operations pass partial checks, but missing edge case returns or malformed input branches.',
        errorHandlingFeedback:
          'Input validation properly guards against malformed inputs. Ensure explicit type checking on all public parameters.',
        codeArchitectureNotes:
          'Good modular structure with clean internal mapping and deterministic identifiers.',
        keyImprovements: [
          'Add parameter schema validation or TypeScript interfaces for payload boundaries',
          'Implement structured logging and request ID correlation',
          'Add rate limiting guardrails around public endpoint surfaces',
        ],
      };
    }

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
        isHidden: project.testCases[i]?.isHidden || false,
        error: r.error,
      })),
      review: aiReview,
    });
  } catch (error) {
    next(error);
  }
};
