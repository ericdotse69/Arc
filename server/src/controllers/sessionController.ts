import { Request, Response } from 'express';
import { SessionService } from '../services/sessionService';

interface StartSessionRequest {
  userId: number;
  category: string;
}

interface EndSessionRequest {
  sessionId: number;
  endTime: string;
  totalDuration: number;
  status: 'completed' | 'interrupted';
  cognitiveLoad?: number;
  category?: string;
  distractions?: number;
  taskId?: number | null;
}

export const SessionController = {
  async startSession(req: Request, res: Response): Promise<void> {
    try {
      const { category, taskId } = req.body as { category: string; taskId?: number };
      const userId = req.userId;

      if (!userId || !category) {
        res.status(400).json({ error: 'Missing required fields: category' });
        return;
      }

      const session = await SessionService.createSession({
        userId,
        startTime: new Date(),
        category,
        taskId,
      });

      res.status(201).json({
        success: true,
        data: session,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async endSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId, endTime, totalDuration, status, cognitiveLoad, category, distractions, taskId } =
        req.body as EndSessionRequest;

      if (!sessionId || !endTime || totalDuration === undefined || !status) {
        res
          .status(400)
          .json({
            error: 'Missing required fields: sessionId, endTime, totalDuration, status',
          });
        return;
      }

      const session = await SessionService.endSession(sessionId, {
        endTime: new Date(endTime),
        totalDuration,
        status,
        cognitiveLoad,
        category,
        distractions,
        taskId,
      });

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async getUserSessions(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;

      if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
      }

      const sessions = await SessionService.getUserSessions(userId);
      res.status(200).json({
        success: true,
        data: sessions,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async getSessionById(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId, 10);

      if (isNaN(sessionIdNum)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
      }

      const session = await SessionService.getSessionById(sessionIdNum);
      if (!session) {
        res.status(404).json({ error: 'Session not found' });
        return;
      }

      res.status(200).json({
        success: true,
        data: session,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async deleteSession(req: Request, res: Response): Promise<void> {
    try {
      const { sessionId } = req.params;
      const sessionIdNum = parseInt(sessionId, 10);

      if (isNaN(sessionIdNum)) {
        res.status(400).json({ error: 'Invalid session ID' });
        return;
      }

      await SessionService.deleteSession(sessionIdNum);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },
};
