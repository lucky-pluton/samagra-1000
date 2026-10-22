import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';

const router = Router();

router.get('/status', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || '00000000-0000-0000-0000-000000000001';

    const qual = await dbService.getScholarshipStatus(userId);
    const progress = await dbService.getStudentProgress(userId);

    res.json({
      success: true,
      isQualified: !!qual,
      completedCount: progress.completed_count,
      remainingCount: Math.max(0, 1000 - progress.completed_count),
      qualification: qual || null
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
