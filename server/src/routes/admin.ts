import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';

const router = Router();

const requireAdmin = async (req: Request, res: Response, next: Function) => {
  const userId = req.headers['x-user-id'] as string;
  const adminSecret = req.headers['x-admin-key'] as string;

  if (adminSecret && adminSecret === process.env.ADMIN_SECRET) {
    return next();
  }

  if (userId) {
    const profile = await dbService.getProfile(userId);
    if (profile && profile.is_admin) {
      return next();
    }
  }

  if (process.env.NODE_ENV !== 'production') {
    return next();
  }

  return res.status(403).json({ success: false, error: 'Access forbidden: Administrator privileges required.' });
};

router.use(requireAdmin);

router.get('/stats', async (_req: Request, res: Response) => {
  try {
    const stats = await dbService.getPlatformStats();
    res.json({
      success: true,
      stats,
      supabaseConnected: dbService.getIsSupabaseConnected()
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/questions-summary', async (_req: Request, res: Response) => {
  try {
    const problems = await dbService.getProblems();
    const easy = problems.filter((p) => p.difficulty === 'easy').length;
    const medium = problems.filter((p) => p.difficulty === 'medium').length;
    const hard = problems.filter((p) => p.difficulty === 'hard').length;

    res.json({
      success: true,
      total_count: problems.length,
      distribution: {
        easy: `${easy} / 300`,
        medium: `${medium} / 400`,
        hard: `${hard} / 300`,
        is_compliant: problems.length === 1000 && easy === 300 && medium === 400 && hard === 300
      }
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
