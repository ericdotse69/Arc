import { TaskRepository } from '../data-access/taskRepository';
import { Task, CreateTaskInput, UpdateTaskInput } from '../models/types';

export const TaskService = {
  async createTask(input: CreateTaskInput): Promise<Task> {
    if (!input.userId || input.userId <= 0) {
      throw new Error('Invalid user ID');
    }
    if (!input.title || input.title.trim().length === 0) {
      throw new Error('Task title is required');
    }
    return TaskRepository.create(input);
  },

  async getUserTasks(userId: number): Promise<Task[]> {
    if (!userId || userId <= 0) {
      throw new Error('Invalid user ID');
    }
    return TaskRepository.findByUserId(userId);
  },

  async updateTask(id: number, input: UpdateTaskInput): Promise<Task> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }
    if (input.title !== undefined && input.title.trim().length === 0) {
      throw new Error('Task title cannot be empty');
    }
    return TaskRepository.update(id, input);
  },

  async deleteTask(id: number): Promise<void> {
    if (!id || id <= 0) {
      throw new Error('Invalid task ID');
    }
    await TaskRepository.delete(id);
  },
};
