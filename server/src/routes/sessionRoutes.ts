import { Router } from 'express';
import { SessionController } from '../controllers/sessionController';

const router = Router();

// POST /api/sessions/start
router.post('/start', SessionController.startSession);

// POST /api/sessions/end
router.post('/end', SessionController.endSession);

// GET /api/sessions/user/:userId
router.get('/user/:userId', SessionController.getUserSessions);

// GET /api/sessions/:sessionId
router.get('/:sessionId', SessionController.getSessionById);

// DELETE /api/sessions/:sessionId
router.delete('/:sessionId', SessionController.deleteSession);

export default router;
