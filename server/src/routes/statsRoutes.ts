import { Router } from 'express';
import { StatsController } from '../controllers/statsController';

const router = Router();

// GET /api/stats/weekly - returns stats for authenticated user
router.get('/weekly', StatsController.getWeeklyStats);

export default router;
