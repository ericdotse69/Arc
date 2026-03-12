import { Request, Response, NextFunction } from 'express';
import authService from '../services/authService';

declare global {
  namespace Express {
    interface Request {
      userId?: number;
      userEmail?: string;
    }
  }
}

/**
 * Middleware to verify JWT token from Authorization header
 * Attaches userId and userEmail to request object
 */
export const authMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      res.status(401).json({
        success: false,
        error: 'Missing or invalid Authorization header',
      });
      return;
    }

    const token = authHeader.substring(7); // Remove "Bearer " prefix

    const decoded = authService.verifyToken(token);
    req.userId = decoded.userId;
    req.userEmail = decoded.email;

    next();
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Token verification failed';
    res.status(401).json({
      success: false,
      error: errorMessage,
    });
  }
};

export default authMiddleware;
