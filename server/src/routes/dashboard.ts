import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';

const router = Router();

router.get('/stats', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || '00000000-0000-0000-0000-000000000001';

    const [profile, progress, submissions, leaderboard] = await Promise.all([
      dbService.getProfile(userId),
      dbService.getStudentProgress(userId),
      dbService.getUserSubmissions(userId),
      dbService.getLeaderboard('all-time')
    ]);

    const userRankEntry = leaderboard.find((entry) => entry.user_id === userId);
    const userRank = userRankEntry ? userRankEntry.rank : leaderboard.length + 1;

    res.json({
      success: true,
      stats: {
        profile,
        progress,
        rank: userRank,
        recentSubmissions: submissions.slice(0, 10),
        completionPercentage: Number(((progress.completed_count / 1000) * 100).toFixed(1)),
        isQualified: userRankEntry?.is_qualified || false
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
