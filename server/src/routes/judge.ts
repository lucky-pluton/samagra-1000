import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';
import { PythonIsolatedRunner } from '../judge/python-isolated-runner.js';
import type { SubmissionStatus, TestResultItem, Submission } from '../types.js';

const router = Router();
const runner = new PythonIsolatedRunner();

router.post('/run', async (req: Request, res: Response) => {
  try {
    const { problemId, code } = req.body;

    if (!problemId || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'problemId and code are required' });
    }

    const problemData = await dbService.getProblemWithAllTests(problemId);
    if (!problemData) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const publicTests = problemData.testCases.filter((t) => t.visibility === 'public');
    if (publicTests.length === 0) {
      return res.status(400).json({ success: false, error: 'No public test cases configured for this problem' });
    }

    const results: TestResultItem[] = [];
    let passedCount = 0;
    let totalTime = 0;
    let overallStatus: SubmissionStatus = 'Accepted';

    for (let idx = 0; idx < publicTests.length; idx++) {
      const tc = publicTests[idx];
      const execResult = await runner.execute(code, tc.input_data, tc.expected_output, problemData.problem.time_limit);

      totalTime += execResult.executionTimeMs;
      const passed = execResult.status === 'Accepted';
      if (passed) passedCount++;
      else if (overallStatus === 'Accepted') overallStatus = execResult.status;

      results.push({
        test_index: idx + 1,
        visibility: 'public',
        passed,
        status: execResult.status,
        input: tc.input_data,
        expected_output: tc.expected_output,
        actual_output: execResult.stdout,
        error: execResult.stderr || execResult.error,
        execution_time_ms: execResult.executionTimeMs
      });
    }

    res.json({
      success: true,
      status: overallStatus,
      passed_count: passedCount,
      total_tests: publicTests.length,
      execution_time_ms: totalTime,
      results
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/submit', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { problemId, code } = req.body;

    if (!problemId || typeof code !== 'string') {
      return res.status(400).json({ success: false, error: 'problemId and code are required' });
    }

    const problemData = await dbService.getProblemWithAllTests(problemId);
    if (!problemData) {
      return res.status(404).json({ success: false, error: 'Problem not found' });
    }

    const allTests = problemData.testCases;
    if (allTests.length === 0) {
      return res.status(500).json({ success: false, error: 'Internal Judge Error: Problem has no configured test suite' });
    }

    const results: TestResultItem[] = [];
    let passedCount = 0;
    let totalTime = 0;
    let maxMemory = 0;
    let overallStatus: SubmissionStatus = 'Accepted';
    let errorMessage: string | undefined = undefined;

    for (let idx = 0; idx < allTests.length; idx++) {
      const tc = allTests[idx];
      const execResult = await runner.execute(code, tc.input_data, tc.expected_output, problemData.problem.time_limit);

      totalTime += execResult.executionTimeMs;
      maxMemory = Math.max(maxMemory, execResult.memoryUsageMb);

      const passed = execResult.status === 'Accepted';
      if (passed) {
        passedCount++;
      } else {
        if (overallStatus === 'Accepted') {
          overallStatus = execResult.status;
          errorMessage = execResult.error || execResult.stderr;
        }
      }

      const item: TestResultItem = {
        test_index: idx + 1,
        visibility: tc.visibility,
        passed,
        status: execResult.status,
        execution_time_ms: execResult.executionTimeMs
      };

      if (tc.visibility === 'public') {
        item.input = tc.input_data;
        item.expected_output = tc.expected_output;
        item.actual_output = execResult.stdout;
        item.error = execResult.stderr || execResult.error;
      } else {
        item.error = passed ? undefined : `Private Test #${idx + 1} Failed`;
      }

      results.push(item);
    }

    const submissionId = `sub-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const submission: Submission = {
      id: submissionId,
      user_id: userId,
      problem_id: problemId,
      submitted_code: code,
      status: overallStatus,
      passed_count: passedCount,
      total_tests: allTests.length,
      execution_time_ms: totalTime,
      memory_usage_mb: maxMemory,
      test_results: results,
      error_message: errorMessage,
      submitted_at: new Date().toISOString()
    };

    await dbService.recordSubmission(submission);

    let completionResult = null;
    if (overallStatus === 'Accepted') {
      completionResult = await dbService.recordProblemCompletion(userId, problemId, submissionId);
    }

    res.json({
      success: true,
      submission_id: submissionId,
      status: overallStatus,
      passed_count: passedCount,
      total_tests: allTests.length,
      execution_time_ms: totalTime,
      memory_usage_mb: maxMemory,
      results,
      error_message: errorMessage,
      newly_completed: completionResult?.newly_completed || false,
      completed_count: completionResult?.completed_count,
      total_points: completionResult?.total_points,
      current_unlocked_sequence: completionResult?.current_unlocked_sequence,
      scholarship_qualified: completionResult?.scholarship_qualified || false,
      qualification_reference: completionResult?.qualification_reference
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/submissions', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const problemId = req.query.problemId ? parseInt(req.query.problemId as string, 10) : undefined;

    const subs = await dbService.getUserSubmissions(userId, problemId);
    res.json({
      success: true,
      submissions: subs
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
