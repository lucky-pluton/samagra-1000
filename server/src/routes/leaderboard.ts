import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const type = (req.query.type as 'all-time' | 'weekly') || 'all-time';
    const leaderboard = await dbService.getLeaderboard(type);

    res.json({
      success: true,
      type,
      count: leaderboard.length,
      leaderboard
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
