import { describe, it, expect, beforeEach } from 'vitest';
import { DatabaseService } from '../server/src/db/database-service';

describe('Authentication & Profile Management', () => {
  let db: DatabaseService;

  beforeEach(() => {
    db = new DatabaseService();
  });

  it('creates a student profile with display name and verified status', async () => {
    const userId = 'user-auth-1';
    const profile = await db.upsertProfile(userId, 'CodeMaster', 'student@example.com');

    expect(profile.id).toBe(userId);
    expect(profile.display_name).toBe('CodeMaster');
    expect(profile.is_verified).toBe(true);

    const fetched = await db.getProfile(userId);
    expect(fetched?.display_name).toBe('CodeMaster');
  });

  it('initializes new student progress at stage 1 with 0 completed questions', async () => {
    const userId = 'user-new-progress';
    await db.upsertProfile(userId, 'FreshCoder', 'fresh@example.com');

    const progress = await db.getStudentProgress(userId);
    expect(progress.completed_count).toBe(0);
    expect(progress.current_unlocked_sequence).toBe(1);
    expect(progress.total_points).toBe(0);
  });

  it('updates display name correctly without losing completed progress', async () => {
    const userId = 'user-rename';
    await db.upsertProfile(userId, 'OldName', 'rename@example.com');
    await db.recordProblemCompletion(userId, 1, 'sub-rename-1');

    // Update display name
    const updated = await db.upsertProfile(userId, 'NewGlory', 'rename@example.com');
    expect(updated.display_name).toBe('NewGlory');

    const progress = await db.getStudentProgress(userId);
    expect(progress.completed_count).toBe(1);
    expect(progress.current_unlocked_sequence).toBe(2);
  });
});
