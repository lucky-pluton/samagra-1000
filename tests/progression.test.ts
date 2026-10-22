import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../server/src/db/database-service';

describe('Question Progression & Unlocking Engine', () => {
  let db: DatabaseService;
  const testUser = 'user-progression-test-1';

  beforeEach(async () => {
    db = new DatabaseService();
    await db.upsertProfile(testUser, 'ProgressTester', 'tester@samagra.annam.ai');
  });

  it('starts a new student with problem 1 unlocked and subsequent problems locked', async () => {
    const problems = await db.getProblems(testUser);
    expect(problems.length).toBe(1000);

    const prob1 = problems.find(p => p.sequence_number === 1);
    const prob2 = problems.find(p => p.sequence_number === 2);
    const prob3 = problems.find(p => p.sequence_number === 3);

    expect(prob1?.is_unlocked).toBe(true);
    expect(prob2?.is_unlocked).toBe(false);
    expect(prob3?.is_unlocked).toBe(false);
  });

  it('unlocks problem 2 only when problem 1 is verified as completed', async () => {
    const completionResult = await db.recordProblemCompletion(testUser, 1, 'sub-test-1');
    expect(completionResult.newly_completed).toBe(true);
    expect(completionResult.completed_count).toBe(1);
    expect(completionResult.current_unlocked_sequence).toBe(2);

    const problemsAfter = await db.getProblems(testUser);
    const prob1 = problemsAfter.find(p => p.sequence_number === 1);
    const prob2 = problemsAfter.find(p => p.sequence_number === 2);
    const prob3 = problemsAfter.find(p => p.sequence_number === 3);

    expect(prob1?.is_completed).toBe(true);
    expect(prob2?.is_unlocked).toBe(true);
    expect(prob3?.is_unlocked).toBe(false);
  });

  it('does not award duplicate credit or increment progress on duplicate completions', async () => {
    const firstComp = await db.recordProblemCompletion(testUser, 1, 'sub-first');
    expect(firstComp.newly_completed).toBe(true);
    expect(firstComp.completed_count).toBe(1);
    const initialPoints = firstComp.total_points;

    // Attempt second completion of problem 1
    const secondComp = await db.recordProblemCompletion(testUser, 1, 'sub-second');
    expect(secondComp.newly_completed).toBe(false);
    expect(secondComp.completed_count).toBe(1);
    expect(secondComp.total_points).toBe(initialPoints);
  });

  it('calculates difficulty breakdown accurately as problems are completed', async () => {
    await db.recordProblemCompletion(testUser, 1, 'sub-1'); // Easy (10 pts)
    const progress = await db.getStudentProgress(testUser);

    expect(progress.easy_completed).toBe(1);
    expect(progress.medium_completed).toBe(0);
    expect(progress.hard_completed).toBe(0);
    expect(progress.total_points).toBe(10);
  });
});
