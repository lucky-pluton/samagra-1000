import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../server/src/db/database-service';

describe('Deterministic Live Leaderboard', () => {
  let db: DatabaseService;

  beforeEach(async () => {
    db = new DatabaseService();
  });

  it('ranks primarily by distinct verified questions completed', async () => {
    await db.upsertProfile('user-a', 'Alice', 'alice@test.com');
    await db.upsertProfile('user-b', 'Bob', 'bob@test.com');

    // Alice completes 2 problems
    await db.recordProblemCompletion('user-a', 1, 'sub-a1');
    await db.recordProblemCompletion('user-a', 2, 'sub-a2');

    // Bob completes 1 problem
    await db.recordProblemCompletion('user-b', 1, 'sub-b1');

    const leaderboard = await db.getLeaderboard('all-time');
    expect(leaderboard[0].user_id).toBe('user-a');
    expect(leaderboard[0].completed_count).toBe(2);
    expect(leaderboard[1].user_id).toBe('user-b');
    expect(leaderboard[1].completed_count).toBe(1);
  });

  it('breaks ties deterministically using difficulty points as secondary measure', async () => {
    await db.upsertProfile('user-easy', 'EasySolver', 'easy@test.com');
    await db.upsertProfile('user-hard', 'HardSolver', 'hard@test.com');

    // EasySolver completes Problem 1 (Easy: 10 pts)
    await db.recordProblemCompletion('user-easy', 1, 'sub-e1');

    // HardSolver completes Problem 701 (Hard: 30 pts)
    await db.recordProblemCompletion('user-hard', 701, 'sub-h1');

    const leaderboard = await db.getLeaderboard('all-time');
    const easyEntry = leaderboard.find(e => e.user_id === 'user-easy');
    const hardEntry = leaderboard.find(e => e.user_id === 'user-hard');

    expect(easyEntry?.completed_count).toBe(1);
    expect(hardEntry?.completed_count).toBe(1);

    // Hard solver has 30 pts vs 10 pts, so hard solver ranks higher
    expect(hardEntry!.rank).toBeLessThan(easyEntry!.rank);
  });

  it('does not expose student email addresses on public leaderboard', async () => {
    await db.upsertProfile('user-private', 'SecretStudent', 'private_email@example.com');
    await db.recordProblemCompletion('user-private', 1, 'sub-p1');

    const leaderboard = await db.getLeaderboard('all-time');
    const entry = leaderboard.find(e => e.user_id === 'user-private');
    expect(entry).toBeDefined();
    expect((entry as any).email).toBeUndefined();
    expect(entry?.display_name).toBe('SecretStudent');
  });
});
