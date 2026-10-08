import ThinkingProfile from '../models/ThinkingProfile.js';
import Roadmap from '../models/Roadmap.js';

// Default 7-day personalized roadmap
const getDefaultRoadmapDays = () => [
  {
    dayNumber: 1,
    topic: 'Database Indexing & Query Optimization',
    description: 'Master compound B-Tree indexes, partial indexes, and eliminate full-table COLLSCAN bottlenecks in MongoDB & PostgreSQL.',
    challengeType: 'Incident Debug',
    actionUrl: '/simulations/current',
    status: 'completed',
  },
  {
    dayNumber: 2,
    topic: 'N+1 Query Elimination & Bulk Aggregations',
    description: 'Refactor sequential per-record queries into optimized aggregate lookups and batch pipelines.',
    challengeType: 'Mission',
    actionUrl: '/missions',
    status: 'current',
  },
  {
    dayNumber: 3,
    topic: 'API Performance & Latency Budgets',
    description: 'Implement streaming JSON responses, response payload gzip compression, and connection pool tuning.',
    challengeType: 'Build Feature',
    actionUrl: '/features',
    status: 'locked',
  },
  {
    dayNumber: 4,
    topic: 'High-Throughput Caching & Invalidation',
    description: 'Design Cache-Aside with Redis, cache stampede prevention via probabilistic early expiration (XFetch).',
    challengeType: 'Mission',
    actionUrl: '/missions',
    status: 'locked',
  },
  {
    dayNumber: 5,
    topic: 'System Design Challenge: 1M User Cart Scaling',
    description: 'Architect horizontally partitioned cart service with redis clustering and asynchronous checkout queue.',
    challengeType: 'System Design',
    actionUrl: '/features',
    status: 'locked',
  },
  {
    dayNumber: 6,
    topic: 'Mock Interview: Architectural Trade-off Defense',
    description: 'Practice defending schema choices, ACID vs BASE tradeoffs, and failover topologies with the AI interviewer.',
    challengeType: 'AI Interview',
    actionUrl: '/interview/simulator',
    status: 'locked',
  },
  {
    dayNumber: 7,
    topic: 'Final Full-Stack Production Assessment',
    description: 'End-to-end simulation covering incident triage, code refactoring, requirement adaptation, and verbal review.',
    challengeType: 'Simulation',
    actionUrl: '/simulations/current',
    status: 'locked',
  },
];

// @desc    Get candidate's Developer Thinking Profile
// @route   GET /api/profile/thinking
// @access  Public (returns profile for candidate or default template)
export const getThinkingProfile = async (req, res, next) => {
  try {
    const candidateId = req.user?._id;

    let profile = null;
    if (candidateId) {
      profile = await ThinkingProfile.findOne({ candidateId });
    }

    if (!profile) {
      profile = await ThinkingProfile.findOne();
      if (!profile) {
        profile = await ThinkingProfile.create({
          candidateId: candidateId || undefined,
          metrics: {
            problemSolving: 91,
            debugging: 94,
            systemThinking: 79,
            adaptability: 96,
            decisionMaking: 87,
            codeQuality: 90,
            communication: 82,
            edgeCaseAwareness: 88,
            failureRecovery: 93,
            performanceAwareness: 85,
          },
          overallReadiness: 89,
          readinessStatus: 'Interview Ready',
          failureRecoveryScore: 93,
          normalPerformance: 88,
          pressurePerformance: 74,
          aiInsights: [
            'Strong at debugging and adapting to changing requirements under tight constraints.',
            'Rapidly recovers from initial failure states by isolating edge-case inputs.',
            'Needs improvement in high-scale database query indexing and performance optimization.',
          ],
        });
      }
    }

    res.status(200).json({
      success: true,
      profile,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get candidate's personalized roadmap
// @route   GET /api/profile/roadmap
// @access  Public
export const getPersonalizedRoadmap = async (req, res, next) => {
  try {
    const candidateId = req.user?._id;

    let roadmap = null;
    if (candidateId) {
      roadmap = await Roadmap.findOne({ candidateId });
    }

    if (!roadmap) {
      roadmap = await Roadmap.findOne();
      if (!roadmap) {
        roadmap = await Roadmap.create({
          candidateId: candidateId || undefined,
          title: '7-Day Engineering Readiness Acceleration',
          weakAreas: ['Database Optimization', 'System Design', 'Communication Under Pressure'],
          days: getDefaultRoadmapDays(),
        });
      }
    }

    res.status(200).json({
      success: true,
      roadmap,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Record a recovery event to update Failure Recovery Score & Pressure metrics
// @route   POST /api/profile/record-recovery
// @access  Public / Private
export const recordRecoveryEvent = async (req, res, next) => {
  try {
    const { hadInitialFailure, iterationsCount, pressureMode, recovered } = req.body;
    const candidateId = req.user?._id;

    let profile = candidateId ? await ThinkingProfile.findOne({ candidateId }) : await ThinkingProfile.findOne();
    if (!profile) {
      profile = await ThinkingProfile.findOne();
    }

    if (profile) {
      if (hadInitialFailure && recovered) {
        // Successful recovery from mistake!
        profile.failureRecoveryScore = Math.min(99, Math.round((profile.failureRecoveryScore || 90) * 0.95 + 98 * 0.05));
        if (profile.metrics) {
          profile.metrics.failureRecovery = profile.failureRecoveryScore;
        }
      }
      if (pressureMode) {
        profile.pressurePerformance = Math.min(99, Math.round((profile.pressurePerformance || 75) * 0.9 + (recovered ? 88 : 65) * 0.1));
      } else {
        profile.normalPerformance = Math.min(99, Math.round((profile.normalPerformance || 85) * 0.95 + (recovered ? 92 : 75) * 0.05));
      }

      await profile.save();
    }

    res.status(200).json({
      success: true,
      failureRecoveryScore: profile?.failureRecoveryScore || 93,
      pressurePerformance: profile?.pressurePerformance || 74,
      normalPerformance: profile?.normalPerformance || 88,
      profile,
    });
  } catch (error) {
    next(error);
  }
};
