import Assessment from '../models/Assessment.js';
import AssessmentCandidate from '../models/AssessmentCandidate.js';
import Problem from '../models/Problem.js';
import Submission from '../models/Submission.js';

// @desc    Get all assessments
// @route   GET /api/assessments
// @access  Public / Candidate / Instructor
export const getAssessments = async (req, res, next) => {
  try {
    const { status, difficulty } = req.query;
    const filter = { isPublished: true };

    if (status && status !== 'All') {
      filter.status = status;
    }
    if (difficulty && difficulty !== 'All') {
      filter.difficulty = difficulty;
    }

    const assessments = await Assessment.find(filter)
      .populate('createdBy', 'name email avatar')
      .sort({ createdAt: -1 });

    // If a candidate is logged in, attach their participation info
    let userAttempts = {};
    if (req.user && req.user.role === 'candidate') {
      const candidateRecords = await AssessmentCandidate.find({
        candidateId: req.user._id,
      });

      for (const rec of candidateRecords) {
        // If in_progress, check if candidate has solved all problems for this assessment
        if (rec.status === 'in_progress') {
          const ass = assessments.find((a) => a._id.toString() === rec.assessmentId.toString());
          if (ass && ass.problems && ass.problems.length > 0) {
            const pIds = ass.problems.map((p) =>
              p.problemId ? (p.problemId._id ? p.problemId._id.toString() : p.problemId.toString()) : p.toString()
            );
            const uniqueSolved = await Submission.distinct('problemId', {
              candidateId: req.user._id,
              assessmentId: rec.assessmentId,
              verdict: 'Accepted',
            });
            const solvedPIds = uniqueSolved.map((id) => id.toString());
            const allSolved = pIds.every((id) => solvedPIds.includes(id));
            if (allSolved) {
              rec.status = 'completed';
              rec.score = 100;
              rec.submittedAt = rec.submittedAt || new Date();
              await rec.save();
            }
          }
        }

        userAttempts[rec.assessmentId.toString()] = {
          candidateStatus: rec.status,
          score: rec.score,
          startedAt: rec.startedAt,
          submittedAt: rec.submittedAt,
        };
      }
    }

    const formatted = assessments.map((a) => {
      const obj = a.toObject();
      obj.candidateInfo = userAttempts[a._id.toString()] || {
        candidateStatus: 'not_started',
        score: null,
      };
      return obj;
    });

    res.status(200).json({
      success: true,
      count: formatted.length,
      assessments: formatted,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get assessment by ID with problem details
// @route   GET /api/assessments/:id
// @access  Public / Candidate / Instructor
export const getAssessmentById = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id)
      .populate({
        path: 'problems.problemId',
        select: '-solution',
      })
      .populate('createdBy', 'name email');

    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    let candidateSession = null;
    let solvedProblemIds = [];
    if (req.user) {
      candidateSession = await AssessmentCandidate.findOne({
        assessmentId: assessment._id,
        candidateId: req.user._id,
      });

      const acceptedSubs = await Submission.find({
        candidateId: req.user._id,
        assessmentId: assessment._id,
        verdict: 'Accepted',
      }).select('problemId');
      solvedProblemIds = [...new Set(acceptedSubs.map((s) => (s.problemId ? s.problemId.toString() : '')))].filter(Boolean);
    }

    res.status(200).json({
      success: true,
      assessment,
      candidateSession,
      solvedProblemIds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new assessment
// @route   POST /api/assessments
// @access  Private (Instructor only)
export const createAssessment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructions,
      duration,
      difficulty,
      problems,
      totalPoints,
      passingScore,
      isAdaptive,
      startTime,
      endTime,
    } = req.body;

    if (!title || !description || !duration) {
      return res.status(400).json({
        success: false,
        message: 'Title, description, and duration are required',
      });
    }

    const assessment = await Assessment.create({
      title,
      description,
      instructions: instructions || 'Read problems carefully. Hidden test cases evaluate edge conditions.',
      duration: parseInt(duration) || 90,
      difficulty: difficulty || 'Medium',
      problems: problems || [],
      totalPoints: totalPoints || 100,
      passingScore: passingScore || 70,
      isAdaptive: !!isAdaptive,
      startTime: startTime || new Date(),
      endTime: endTime || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
      createdBy: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Assessment created successfully',
      assessment,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Start an assessment session for a candidate
// @route   POST /api/assessments/:id/start
// @access  Private (Candidate only)
export const startAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findById(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    let record = await AssessmentCandidate.findOne({
      assessmentId: assessment._id,
      candidateId: req.user._id,
    });

    const now = new Date();
    const durationMs = (assessment.duration || 90) * 60 * 1000;

    if (!record) {
      const expiresAt = new Date(now.getTime() + durationMs);
      record = await AssessmentCandidate.create({
        assessmentId: assessment._id,
        candidateId: req.user._id,
        status: 'in_progress',
        startedAt: now,
        expiresAt,
        totalScore: assessment.totalPoints || 100,
      });
    } else if (record.status === 'completed') {
      if (req.user.role === 'instructor' || req.user.role === 'admin') {
        record.status = 'in_progress';
        record.startedAt = now;
        record.expiresAt = new Date(now.getTime() + durationMs);
        await record.save();
      } else {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this assessment',
          record,
        });
      }
    } else if (record.status === 'not_started') {
      record.status = 'in_progress';
      record.startedAt = now;
      record.expiresAt = new Date(now.getTime() + durationMs);
      await record.save();
    }

    // Calculate remaining seconds
    const remainingSeconds = Math.max(
      0,
      Math.floor((new Date(record.expiresAt).getTime() - Date.now()) / 1000)
    );

    res.status(200).json({
      success: true,
      message: 'Assessment session started',
      record,
      remainingSeconds,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Submit an assessment
// @route   POST /api/assessments/:id/submit
// @access  Private (Candidate only)
export const submitAssessment = async (req, res, next) => {
  try {
    const record = await AssessmentCandidate.findOne({
      assessmentId: req.params.id,
      candidateId: req.user._id,
    });

    if (!record) {
      return res.status(404).json({
        success: false,
        message: 'No active session found for this assessment',
      });
    }

    record.status = 'completed';
    record.submittedAt = new Date();
    // In Phase 3 & 4 this aggregates test case scores, for now compute default or existing
    record.score = record.score || 85;
    await record.save();

    // Increment candidate assessments completed counter
    if (req.user) {
      req.user.assessmentsCompleted = (req.user.assessmentsCompleted || 0) + 1;
      await req.user.save();
    }

    res.status(200).json({
      success: true,
      message: 'Assessment submitted successfully',
      record,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete an assessment
// @route   DELETE /api/assessments/:id
// @access  Private (Instructor only)
export const deleteAssessment = async (req, res, next) => {
  try {
    const assessment = await Assessment.findByIdAndDelete(req.params.id);
    if (!assessment) {
      return res.status(404).json({
        success: false,
        message: 'Assessment not found',
      });
    }

    await AssessmentCandidate.deleteMany({ assessmentId: req.params.id });

    res.status(200).json({
      success: true,
      message: 'Assessment deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};
