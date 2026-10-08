import InterviewSession from '../models/InterviewSession.js';
import Problem from '../models/Problem.js';
import {
  generateRealInterviewRound,
  generateFullInterviewReport,
  ROUND_DEFINITIONS,
} from '../services/geminiService.js';

// @desc    Start a new real technical interview session
// @route   POST /api/interviews/start
// @access  Private (Candidate)
export const startInterview = async (req, res, next) => {
  try {
    const {
      jobRole = 'Full Stack Developer',
      experienceLevel = 'Junior (0-2 yrs)',
      preferredTech = 'JavaScript, React, Node.js',
      difficulty = 'Standard',
      problemId,
    } = req.body;

    let targetProblem = null;
    if (problemId) {
      targetProblem = await Problem.findById(problemId);
    }
    if (!targetProblem) {
      // Pick default problem
      targetProblem = await Problem.findOne({ isPublished: true });
    }

    if (!targetProblem) {
      return res.status(404).json({ success: false, message: 'No problem available for interview' });
    }

    // Initialize Round 1 kickoff
    const round1Def = ROUND_DEFINITIONS[0];
    const round1AiResult = await generateRealInterviewRound({
      jobRole,
      experienceLevel,
      preferredTech,
      difficulty,
      problem: targetProblem,
      round: 1,
      dialogueHistory: [],
      candidateAnswer: '',
      candidateCode: targetProblem.starterCode?.javascript || '',
    });

    const session = await InterviewSession.create({
      candidateId: req.user._id,
      jobRole,
      experienceLevel,
      preferredTech,
      difficulty,
      status: 'in_progress',
      currentRound: 1,
      problemId: targetProblem._id,
      codingSolution: {
        code: targetProblem.starterCode?.javascript || '',
        language: 'javascript',
      },
      transcript: [
        {
          round: 1,
          roundName: round1Def.name,
          interviewerQuestion: round1AiResult.interviewerQuestion,
          evaluation: round1AiResult.evaluation,
          roundScore: round1AiResult.roundScore || 90,
          feedback: round1AiResult.feedback,
          timestamp: new Date(),
        },
      ],
    });

    const populatedSession = await InterviewSession.findById(session._id).populate('problemId');

    res.status(201).json({
      success: true,
      message: 'Real Interview Simulator session initialized',
      session: populatedSession,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Step interview: evaluate answer and generate next round / question
// @route   POST /api/interviews/:id/step
// @access  Private (Candidate)
export const stepInterview = async (req, res, next) => {
  try {
    const { answer, currentCode, codingVerdict, testsPassed, totalTests } = req.body;

    const session = await InterviewSession.findById(req.params.id).populate('problemId');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }

    if (session.status === 'completed') {
      return res.status(400).json({ success: false, message: 'Interview already completed' });
    }

    const currentRound = session.currentRound;

    // Update code snapshot if provided
    if (currentCode) {
      session.codingSolution.code = currentCode;
    }
    if (codingVerdict) {
      session.codingSolution.verdict = codingVerdict;
      session.codingSolution.testsPassed = testsPassed || 0;
      session.codingSolution.totalTests = totalTests || 0;
    }

    // Find the latest message in transcript for this round
    const lastMsgIndex = session.transcript.length - 1;
    if (lastMsgIndex >= 0) {
      session.transcript[lastMsgIndex].candidateAnswer = answer || '(Answer submitted via code editor)';
      if (currentCode) {
        session.transcript[lastMsgIndex].candidateCode = currentCode;
      }
    }

    // Check if we reached the final round (Round 6)
    if (currentRound >= 6) {
      session.status = 'completed';
      session.currentRound = 6;

      // Generate final 8-pillar report
      const fullReport = await generateFullInterviewReport({
        session,
        problem: session.problemId,
      });

      session.scores = fullReport.scores;
      session.report = fullReport.report;
      await session.save();

      return res.status(200).json({
        success: true,
        completed: true,
        message: 'Technical interview completed! Report ready.',
        session,
      });
    }

    // Advance to next round: currentRound + 1
    const nextRoundNumber = currentRound + 1;
    const nextRoundDef = ROUND_DEFINITIONS.find((r) => r.round === nextRoundNumber) || ROUND_DEFINITIONS[nextRoundNumber - 1];

    const aiStep = await generateRealInterviewRound({
      jobRole: session.jobRole,
      experienceLevel: session.experienceLevel,
      preferredTech: session.preferredTech,
      difficulty: session.difficulty,
      problem: session.problemId,
      round: nextRoundNumber,
      dialogueHistory: session.transcript,
      candidateAnswer: answer,
      candidateCode: session.codingSolution?.code || currentCode,
    });

    // Update evaluation of the round just finished
    if (lastMsgIndex >= 0 && aiStep.evaluation) {
      session.transcript[lastMsgIndex].evaluation = aiStep.evaluation;
      session.transcript[lastMsgIndex].roundScore = aiStep.roundScore || 85;
      session.transcript[lastMsgIndex].feedback = aiStep.feedback || '';
    }

    // Add new question entry for next round
    session.currentRound = nextRoundNumber;
    session.transcript.push({
      round: nextRoundNumber,
      roundName: nextRoundDef.name,
      interviewerQuestion: aiStep.interviewerQuestion,
      evaluation: '',
      roundScore: 0,
      feedback: '',
      timestamp: new Date(),
    });

    await session.save();

    res.status(200).json({
      success: true,
      completed: false,
      currentRound: nextRoundNumber,
      roundName: nextRoundDef.name,
      session,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get interview session details
// @route   GET /api/interviews/:id
// @access  Private
export const getInterviewById = async (req, res, next) => {
  try {
    const session = await InterviewSession.findById(req.params.id).populate('problemId');
    if (!session) {
      return res.status(404).json({ success: false, message: 'Interview session not found' });
    }
    res.status(200).json({ success: true, session });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all interview sessions for current user
// @route   GET /api/interviews/my
// @access  Private
export const getMyInterviews = async (req, res, next) => {
  try {
    const sessions = await InterviewSession.find({ candidateId: req.user._id })
      .populate('problemId', 'title difficulty topic')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: sessions.length, sessions });
  } catch (error) {
    next(error);
  }
};
