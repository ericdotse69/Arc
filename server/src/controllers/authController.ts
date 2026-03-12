import { Request, Response } from 'express';
import { RegisterInput, LoginInput } from '../models/types';
import authService from '../services/authService';

export class AuthController {
  /**
   * POST /api/auth/register
   * Register a new user
   */
  async register(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const input: RegisterInput = { email, password };
      const { user, token } = await authService.register(input);

      res.status(201).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Registration failed';
      res.status(400).json({
        success: false,
        error: errorMessage,
      });
    }
  }

  /**
   * POST /api/auth/login
   * Login user and return JWT token
   */
  async login(req: Request, res: Response): Promise<void> {
    try {
      const { email, password } = req.body;

      const input: LoginInput = { email, password };
      const { user, token } = await authService.login(input);

      res.status(200).json({
        success: true,
        user: {
          id: user.id,
          email: user.email,
        },
        token,
      });
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Login failed';
      res.status(401).json({
        success: false,
        error: errorMessage,
      });
    }
  }
}

export default new AuthController();
