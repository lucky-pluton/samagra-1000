import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../server/src/db/database-service';

describe('Automatic Scholarship Qualification Engine', () => {
  let db: DatabaseService;
  const scholarUser = 'user-scholar-1000';

  beforeEach(async () => {
    db = new DatabaseService();
    await db.upsertProfile(scholarUser, 'GrandmasterCoder', 'scholar@samagra.annam.ai');
  });

  it('does NOT qualify student when completed count is 999', async () => {
    // Simulate 999 completions directly on student progress
    const progress = await db.getStudentProgress(scholarUser);
    progress.completed_count = 998;

    // Complete 999th problem
    const res = await db.recordProblemCompletion(scholarUser, 999, 'sub-999');
    expect(res.completed_count).toBe(999);
    expect(res.scholarship_qualified).toBe(false);

    const qualStatus = await db.getScholarshipStatus(scholarUser);
    expect(qualStatus).toBeNull();
  });

  it('automatically qualifies student upon 1,000th verified problem completion', async () => {
    // Set student to 999 completed problems
    const progress = await db.getStudentProgress(scholarUser);
    progress.completed_count = 999;

    // Record the 1,000th completion
    const res = await db.recordProblemCompletion(scholarUser, 1000, 'sub-1000');
    expect(res.completed_count).toBe(1000);
    expect(res.scholarship_qualified).toBe(true);
    expect(res.qualification_reference).toBeDefined();
    expect(res.qualification_reference).toContain('SAMAGRA-1000-');

    const qual = await db.getScholarshipStatus(scholarUser);
    expect(qual).not.toBeNull();
    expect(qual?.qualification_status).toBe('qualified');
    expect(qual?.confirmation_status).toBe('confirmed');
    expect(qual?.completed_count_at_qualification).toBe(1000);
    expect(qual?.display_name).toBe('GrandmasterCoder');
  });

  it('is strictly idempotent: repeated triggers do not duplicate qualification', async () => {
    const progress = await db.getStudentProgress(scholarUser);
    progress.completed_count = 999;

    // Complete 1,000th
    const firstRes = await db.recordProblemCompletion(scholarUser, 1000, 'sub-1000-first');
    expect(firstRes.scholarship_qualified).toBe(true);
    const initialRef = firstRes.qualification_reference;

    // Repeated call for already completed 1,000th
    const repeatRes = await db.recordProblemCompletion(scholarUser, 1000, 'sub-1000-second');
    expect(repeatRes.newly_completed).toBe(false);
    expect(repeatRes.scholarship_qualified).toBe(true);
    expect(repeatRes.qualification_reference).toBe(initialRef);

    // Platform stats must record exactly 1 qualification
    const stats = await db.getPlatformStats();
    expect(stats.scholarship_qualifications_count).toBe(1);
  });
});
