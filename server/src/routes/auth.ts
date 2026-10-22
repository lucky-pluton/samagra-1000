import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';

const router = Router();

router.get('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || '00000000-0000-0000-0000-000000000001';
    let profile = await dbService.getProfile(userId);

    if (!profile) {
      profile = await dbService.upsertProfile(userId, `Student-${userId.substring(0, 6)}`);
    }

    res.json({
      success: true,
      profile
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.post('/profile', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || '00000000-0000-0000-0000-000000000001';
    const { display_name, email } = req.body;

    if (!display_name || typeof display_name !== 'string' || display_name.trim().length < 3) {
      return res.status(400).json({ success: false, error: 'Display name must be at least 3 characters long' });
    }

    const reservedNames = ['admin', 'samagra', 'director', 'annam', 'support', 'moderator', 'system'];
    if (reservedNames.some((r) => display_name.toLowerCase().includes(r))) {
      return res.status(400).json({ success: false, error: 'Display name contains reserved or prohibited terms' });
    }

    const updated = await dbService.upsertProfile(userId, display_name.trim(), email);
    res.json({
      success: true,
      profile: updated
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
