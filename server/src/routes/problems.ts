import { Router, Request, Response } from 'express';
import { dbService } from '../db/database-service.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  try {
    const userId = (req.headers['x-user-id'] as string) || undefined;
    const { difficulty, stage, search } = req.query;

    let problems = await dbService.getProblems(userId);

    if (difficulty && typeof difficulty === 'string') {
      problems = problems.filter((p) => p.difficulty === difficulty.toLowerCase());
    }

    if (stage) {
      const stageNum = parseInt(stage as string, 10);
      if (!isNaN(stageNum)) {
        problems = problems.filter((p) => p.stage === stageNum);
      }
    }

    if (search && typeof search === 'string') {
      const q = search.toLowerCase();
      problems = problems.filter(
        (p) =>
          p.title.toLowerCase().includes(q) ||
          p.topic.toLowerCase().includes(q) ||
          p.sequence_number.toString() === q
      );
    }

    res.json({
      success: true,
      count: problems.length,
      problems
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  try {
    const idParam = String(req.params.id);
    const problemId = parseInt(idParam, 10);

    if (isNaN(problemId)) {
      return res.status(400).json({ success: false, error: 'Invalid problem ID' });
    }

    const problem = await dbService.getProblemById(problemId);
    if (!problem) {
      return res.status(404).json({ success: false, error: 'Problem not found or not published' });
    }

    res.json({
      success: true,
      problem
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
