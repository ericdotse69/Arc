import express from 'express';
import authController from '../controllers/authController';

const router = express.Router();

/**
 * POST /api/auth/register
 * Register a new user
 */
router.post('/register', authController.register.bind(authController));

/**
 * POST /api/auth/login
 * Login user and receive JWT token
 */
router.post('/login', authController.login.bind(authController));

export default router;
