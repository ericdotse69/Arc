import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

export type User = {
  id: number;
  email: string;
  passwordHash: string;
  createdAt: Date;
  updatedAt: Date;
};

export type Session = {
  id: number;
  userId: number;
  startTime: Date;
  endTime: Date | null;
  totalDuration: number | null;
  category: string;
  cognitiveLoad: number | null;
  distractions: number;
  flowScore: number | null;
  status: 'completed' | 'interrupted';
  taskId?: number | null; // optional reference to a task
  createdAt: Date;
  updatedAt: Date;
};

export type CreateSessionInput = {
  userId: number;
  startTime: Date;
  category: string;
  taskId?: number;
};

export type UpdateSessionInput = {
  endTime: Date;
  totalDuration: number;
  status: 'completed' | 'interrupted';
  cognitiveLoad?: number;
  category?: string;
  distractions?: number;
  taskId?: number | null;
};

export type Task = {
  id: number;
  userId: number;
  title: string;
  description?: string | null;
  completed: boolean;
  createdAt: Date;
  updatedAt: Date;
};

export type CreateTaskInput = {
  userId: number;
  title: string;
  description?: string;
};

export type UpdateTaskInput = {
  title?: string;
  description?: string;
  completed?: boolean;
};

export type RegisterInput = {
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};
