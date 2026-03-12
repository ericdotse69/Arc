import { Router, Request, Response } from 'express';
import { TaskController } from '../controllers/taskController';

const router = Router();

// GET /api/tasks - get authenticated user's tasks
router.get('/', TaskController.getUserTasks);

// POST /api/tasks - create a new task
router.post('/', TaskController.createTask);

// PUT /api/tasks/:taskId - update a task
router.put('/:taskId', TaskController.updateTask);

// DELETE /api/tasks/:taskId - remove a task
router.delete('/:taskId', TaskController.deleteTask);

export default router;
