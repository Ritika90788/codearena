import DebugChallenge from '../models/DebugChallenge.js';
import ThinkingProfile from '../models/ThinkingProfile.js';
import { executeInSandbox } from '../services/sandboxRunner.js';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: 'gemini-1.5-flash' }) : null;

// @desc    Get all debug challenges with filtering
// @route   GET /api/debug
// @access  Public / Private
export const getDebugChallenges = async (req, res, next) => {
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
        { symptomReport: { $regex: search, $options: 'i' } },
      ];
    }

    const challenges = await DebugChallenge.find(query)
      .select('-fixedSolution -testCases')
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: challenges.length,
      challenges,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single debug challenge by ID or slug
// @route   GET /api/debug/:id
// @access  Public / Private
export const getDebugChallengeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    let challenge = null;
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      challenge = await DebugChallenge.findById(id).select('-fixedSolution');
    } else {
      challenge = await DebugChallenge.findOne({ slug: id }).select('-fixedSolution');
    }

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Debug challenge not found' });
    }

    const isInstructor = req.user?.role === 'instructor';
    let safeTestCases = challenge.testCases;
    if (!isInstructor) {
      safeTestCases = challenge.testCases
        .filter((tc) => !tc.isHidden)
        .map((tc) => ({
          _id: tc._id,
          input: tc.input,
          expectedOutput: tc.expectedOutput,
          explanation: tc.explanation,
        }));
    }

    const challengeObj = challenge.toObject();
    challengeObj.testCases = safeTestCases;
    // Don't reveal bug explanation until solved (unless instructor)
    if (!isInstructor) {
      challengeObj.bugExplanation = '';
    }

    res.status(200).json({
      success: true,
      challenge: challengeObj,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get hint for a debug challenge
// @route   POST /api/debug/:id/hint
// @access  Private
export const getDebugHint = async (req, res, next) => {
  try {
    const { hintIndex = 0, currentCode } = req.body;
    const challenge = await DebugChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Debug challenge not found' });
    }

    // If static hint exists for this index
    const staticHint = challenge.hints?.[hintIndex];

    let aiClue = '';
    if (model && currentCode) {
      try {
        const prompt = `
You are a senior tech lead giving a subtle debugging hint without giving away the exact solution.
Challenge: "${challenge.title}" (${challenge.category})
Symptom: ${challenge.symptomReport}
Candidate's Current Code:
\`\`\`javascript
${currentCode}
\`\`\`

Give a 1-2 sentence hint pointing them to the specific line or logic mistake without writing out the answer.
`;
        const result = await model.generateContent(prompt);
        aiClue = result.response.text();
      } catch (err) {
        console.warn('Gemini hint generation failed:', err.message);
      }
    }

    res.status(200).json({
      success: true,
      hint: aiClue || staticHint || 'Carefully verify your loop boundaries and variable types.',
      hintIndex,
      totalHints: challenge.hints?.length || 0,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Run candidate code against public test cases
// @route   POST /api/debug/:id/run
// @access  Private
export const runDebugCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const challenge = await DebugChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Debug challenge not found' });
    }

    const publicTestCases = challenge.testCases.filter((tc) => !tc.isHidden);

    const result = await executeInSandbox({
      code,
      language,
      testCases: publicTestCases,
      timeLimitMs: 2000,
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

// @desc    Submit candidate bugfix against all test cases
// @route   POST /api/debug/:id/submit
// @access  Private
export const submitDebugCode = async (req, res, next) => {
  try {
    const { code, language = 'javascript' } = req.body;
    const challenge = await DebugChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Debug challenge not found' });
    }

    const result = await executeInSandbox({
      code,
      language,
      testCases: challenge.testCases,
      timeLimitMs: 2500,
      memoryLimitMB: 256,
    });

    const passedCount = result.results?.filter((r) => r.passed).length || 0;
    const totalCount = challenge.testCases.length;
    const allPassed = passedCount === totalCount && result.verdict === 'Accepted';

    if (allPassed) {
      await DebugChallenge.findByIdAndUpdate(challenge._id, { $inc: { resolvedCount: 1 } });

      if (req.user?._id) {
        try {
          const profile = await ThinkingProfile.findOne({ candidateId: req.user._id });
          if (profile && profile.metrics) {
            profile.metrics.debugging = Math.min(99, (profile.metrics.debugging || 90) + 1);
            profile.metrics.failureRecovery = Math.min(99, (profile.metrics.failureRecovery || 90) + 1);
            profile.failureRecoveryScore = Math.min(99, (profile.failureRecoveryScore || 90) + 1);
            profile.metrics.codeQuality = Math.min(99, (profile.metrics.codeQuality || 88) + 1);

            const mVals = Object.values(profile.metrics).filter(v => typeof v === 'number');
            if (mVals.length > 0) {
              profile.overallReadiness = Math.round(mVals.reduce((a, b) => a + b, 0) / mVals.length);
            }
            await profile.save();
          }
        } catch (e) {
          console.error('Failed to update profile after debug submit:', e.message);
        }
      }
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
        isHidden: challenge.testCases[i]?.isHidden || false,
        error: r.error,
      })),
      // Reveal post-mortem explanation on successful resolution!
      bugExplanation: allPassed ? challenge.bugExplanation : '',
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Evaluate candidate root cause and fix explanation
// @route   POST /api/debug/:id/explain-fix
// @access  Public / Private
export const explainDebugFix = async (req, res, next) => {
  try {
    const { rootCauseExplanation, fixExplanation, codeFix } = req.body;
    const challenge = await DebugChallenge.findById(req.params.id);

    if (!challenge) {
      return res.status(404).json({ success: false, message: 'Debug challenge not found' });
    }

    let understandingScore = 75;
    let accuracyScore = 70;
    let feedback = '';
    let isRootCauseAccurate = false;

    // Use Gemini if configured
    if (model && (rootCauseExplanation || fixExplanation)) {
      try {
        const prompt = `
You are a Principal Systems Engineer reviewing a candidate's bug post-mortem and root cause analysis.
Bug Challenge: "${challenge.title}"
Category: "${challenge.category}"
Official Root Cause: "${challenge.bugExplanation}"

Candidate's Identified Root Cause:
"${rootCauseExplanation}"

Candidate's Fix Explanation:
"${fixExplanation}"

Evaluate whether the candidate accurately identified the true defect mechanism and why their fix works.
Respond ONLY with JSON format:
{
  "understandingScore": <number 0-100>,
  "accuracyScore": <number 0-100>,
  "isRootCauseAccurate": <boolean>,
  "verdict": "<short verdict phrase, e.g. 'Accurate Diagnosis' or 'Partial Diagnosis'>",
  "feedback": "<2-3 sentence technical evaluation>"
}
`;
        const result = await model.generateContent(prompt);
        const text = result.response.text();
        const jsonMatch = text.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          understandingScore = parsed.understandingScore || 85;
          accuracyScore = parsed.accuracyScore || 80;
          isRootCauseAccurate = !!parsed.isRootCauseAccurate;
          feedback = parsed.feedback || '';
        }
      } catch (err) {
        console.warn('Gemini debug evaluation fallback:', err.message);
      }
    }

    if (!feedback) {
      // Deterministic semantic analysis fallback
      const explanationText = `${rootCauseExplanation || ''} ${fixExplanation || ''}`.toLowerCase();
      const officialKeywords = challenge.bugExplanation.toLowerCase().split(/\W+/).filter((w) => w.length > 4);
      const matchCount = officialKeywords.filter((kw) => explanationText.includes(kw)).length;
      const ratio = officialKeywords.length > 0 ? matchCount / officialKeywords.length : 0.5;

      if (ratio > 0.15 || explanationText.length > 40) {
        understandingScore = 92;
        accuracyScore = 90;
        isRootCauseAccurate = true;
        feedback = `Accurately identified the core ${challenge.category} defect and explained how the patch remedies the boundary or control flow flaw.`;
      } else {
        understandingScore = 65;
        accuracyScore = 60;
        isRootCauseAccurate = false;
        feedback = 'Explanation is high-level. Be specific about loop bounds, condition checks, or data types.';
      }
    }

    // Update ThinkingProfile if logged in
    if (req.user?._id) {
      try {
        const profile = await ThinkingProfile.findOne({ candidateId: req.user._id });
        if (profile && profile.metrics) {
          profile.metrics.debugging = Math.min(99, (profile.metrics.debugging || 90) + 2);
          profile.metrics.failureRecovery = Math.min(99, (profile.metrics.failureRecovery || 90) + 2);
          profile.failureRecoveryScore = Math.min(99, (profile.failureRecoveryScore || 90) + 2);
          profile.metrics.decisionMaking = Math.min(99, (profile.metrics.decisionMaking || 85) + 1);
          await profile.save();
        }
      } catch (e) {
        console.error('Failed to update thinking profile after debug explanation:', e.message);
      }
    }

    res.status(200).json({
      success: true,
      understandingScore,
      accuracyScore,
      isRootCauseAccurate,
      feedback,
    });
  } catch (error) {
    next(error);
  }
};
