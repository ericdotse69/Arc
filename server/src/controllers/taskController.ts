import { Request, Response } from 'express';
import { TaskService } from '../services/taskService';

interface CreateTaskRequest {
  title: string;
  description?: string;
}

interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

export const TaskController = {
  async createTask(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      const { title, description } = req.body as CreateTaskRequest;

      if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
      }
      if (!title || title.trim().length === 0) {
        res.status(400).json({ error: 'Title is required' });
        return;
      }

      console.log('TaskController.createTask called, body=', req.body, 'userId=', userId);
      const task = await TaskService.createTask({
        userId,
        title,
        description,
      });

      res.status(201).json({ success: true, data: task });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async getUserTasks(req: Request, res: Response): Promise<void> {
    try {
      const userId = req.userId;
      if (!userId) {
        res.status(400).json({ error: 'User not authenticated' });
        return;
      }
      console.log('TaskController.getUserTasks called for user', userId);
      const tasks = await TaskService.getUserTasks(userId);
      res.status(200).json({ success: true, data: tasks });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async updateTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      const { title, description, completed } = req.body as UpdateTaskRequest;

      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }

      const updated = await TaskService.updateTask(taskId, {
        title,
        description,
        completed,
      });

      res.status(200).json({ success: true, data: updated });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },

  async deleteTask(req: Request, res: Response): Promise<void> {
    try {
      const taskId = parseInt(req.params.taskId, 10);
      if (isNaN(taskId)) {
        res.status(400).json({ error: 'Invalid task ID' });
        return;
      }
      await TaskService.deleteTask(taskId);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      res.status(400).json({ error: message });
    }
  },
};
