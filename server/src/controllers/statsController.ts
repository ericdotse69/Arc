import { Request, Response } from 'express';
import { StatsService } from '../services/statsService';

export const StatsController = {
  async getWeeklyStats(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(401).json({ error: 'User not authenticated' });
        return;
      }

      const stats = await StatsService.getWeeklyStats(userId);

      res.status(200).json({
        success: true,
        data: stats,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },
};
