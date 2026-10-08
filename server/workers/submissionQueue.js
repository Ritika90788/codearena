import { executeInSandbox } from '../services/sandboxRunner.js';
import Submission from '../models/Submission.js';
import ExecutionLog from '../models/ExecutionLog.js';
import Problem from '../models/Problem.js';
import TestCase from '../models/TestCase.js';
import User from '../models/User.js';
import Assessment from '../models/Assessment.js';
import AssessmentCandidate from '../models/AssessmentCandidate.js';

class SubmissionQueue {
  constructor(concurrency = 3) {
    this.concurrency = concurrency;
    this.activeWorkers = 0;
    this.queue = [];
  }

  /**
   * Enqueue a submission job for processing
   */
  async add(submissionId) {
    this.queue.push(submissionId);
    console.log(`[Queue] Added submission ${submissionId}. Queue length: ${this.queue.length}`);
    this.processNext();
  }

  async processNext() {
    if (this.activeWorkers >= this.concurrency || this.queue.length === 0) {
      return;
    }

    const submissionId = this.queue.shift();
    this.activeWorkers++;

    try {
      await this.processSubmission(submissionId);
    } catch (err) {
      console.error(`[Queue Error: ${submissionId}]`, err);
    } finally {
      this.activeWorkers--;
      this.processNext();
    }
  }

  async processSubmission(submissionId) {
    const submission = await Submission.findById(submissionId);
    if (!submission) return;

    submission.status = 'running';
    await submission.save();

    const problem = await Problem.findById(submission.problemId);
    if (!problem) {
      submission.status = 'failed';
      submission.verdict = 'Runtime Error';
      submission.error = 'Problem definition not found';
      await submission.save();
      return;
    }

    // Retrieve all test cases (both public and hidden) for complete grading
    const testCases = await TestCase.find({ problemId: problem._id }).sort({ order: 1 });

    console.log(`[Worker] Running submission ${submission._id} against ${testCases.length} test cases...`);

    const result = await executeInSandbox({
      code: submission.code,
      language: submission.language,
      testCases,
      timeLimitMs: problem.timeLimit || 2000,
      memoryLimitMB: problem.memoryLimit || 256,
    });

    const passedCount = result.results ? result.results.filter((r) => r.passed).length : 0;
    const totalCount = testCases.length;
    const score = totalCount > 0 ? Math.round((passedCount / totalCount) * 100) : 0;

    submission.status = 'completed';
    submission.verdict = result.verdict || (passedCount === totalCount ? 'Accepted' : 'Wrong Answer');
    submission.testsPassed = passedCount;
    submission.totalTests = totalCount;
    submission.score = score;
    submission.executionTime = result.totalExecutionTime || 0;
    submission.memoryUsage = result.memoryUsage || 0;
    submission.error = result.compileError || result.error || '';
    submission.testResults = result.results || [];

    await submission.save();

    // If accepted, update user's solved count and streak (deduplicated by problem)
    if (submission.verdict === 'Accepted') {
      const priorAccepted = await Submission.findOne({
        _id: { $ne: submission._id },
        candidateId: submission.candidateId,
        problemId: problem._id,
        verdict: 'Accepted',
      });
      if (!priorAccepted) {
        await User.findByIdAndUpdate(submission.candidateId, {
          $inc: { problemsSolved: 1, streak: 1 },
        });
      }
      await Problem.findByIdAndUpdate(problem._id, {
        $inc: { acceptedCount: 1, submissionsCount: 1 },
      });
    } else {
      await Problem.findByIdAndUpdate(problem._id, {
        $inc: { submissionsCount: 1 },
      });
    }

    // If this submission belongs to an assessment, check if candidate has solved all problems
    if (submission.assessmentId && submission.verdict === 'Accepted') {
      try {
        const assessment = await Assessment.findById(submission.assessmentId);
        if (assessment && assessment.problems && assessment.problems.length > 0) {
          const pIds = assessment.problems.map((p) =>
            p.problemId ? (p.problemId._id ? p.problemId._id.toString() : p.problemId.toString()) : p.toString()
          );
          const uniqueSolved = await Submission.distinct('problemId', {
            candidateId: submission.candidateId,
            assessmentId: submission.assessmentId,
            verdict: 'Accepted',
          });
          const solvedIds = uniqueSolved.map((id) => id.toString());
          const allSolved = pIds.every((id) => solvedIds.includes(id));

          if (allSolved) {
            console.log(`[Worker] Candidate ${submission.candidateId} completed all problems in assessment ${submission.assessmentId}!`);
            await AssessmentCandidate.findOneAndUpdate(
              { assessmentId: submission.assessmentId, candidateId: submission.candidateId },
              {
                $set: {
                  status: 'completed',
                  score: 100,
                  submittedAt: new Date(),
                },
              },
              { new: true }
            );
            await User.findByIdAndUpdate(submission.candidateId, {
              $inc: { assessmentsCompleted: 1 },
            });
          }
        }
      } catch (err) {
        console.error('[Worker] Error updating assessment completion status:', err);
      }
    }

    // Write Execution Log for instructors
    await ExecutionLog.create({
      submissionId: submission._id,
      candidateId: submission.candidateId,
      problemId: submission.problemId,
      compileStatus: result.compileError ? 'FAILED' : 'SUCCESS',
      executionStatus: submission.verdict,
      executionTimeMs: submission.executionTime,
      memoryUsageMB: submission.memoryUsage,
      testsPassed: passedCount,
      totalTests: totalCount,
      systemLogs: result.consoleLogs ? result.consoleLogs.join('\n') : '',
      workerId: `worker-node-${process.pid}`,
    });

    console.log(`[Worker] Submission ${submission._id} finalized. Verdict: ${submission.verdict} (${passedCount}/${totalCount})`);
  }
}

export const submissionQueue = new SubmissionQueue(3);
export default submissionQueue;
