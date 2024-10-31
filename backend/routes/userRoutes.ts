import express, { Request, Response, NextFunction } from 'express';
import { createUser, getUserByEmail } from '../services/userService';
import { UserInput } from '../models/User';
import { body, validationResult } from 'express-validator';

const router = express.Router();

const validateRegistration = [
  body('username').isLength({ min: 3 }).withMessage('Username must be at least 3 characters long'),
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

const validateLogin = [
  body('email').isEmail().withMessage('Invalid email address'),
  body('password').notEmpty().withMessage('Password is required'),
];

const handleValidationErrors = (req: Request, res: Response, next: NextFunction) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

/**
 * @swagger
 * /api/users/register:
 *   post:
 *     summary: Register a new user (Development Mode)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *                 minimum: 3
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *                 minimum: 6
 *     responses:
 *       201:
 *         description: User created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post('/register', validateRegistration, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    // In development mode, always return success with default user
    res.status(201).json({ 
      message: 'Development Mode: User registration simulated', 
      userId: 1,
      note: 'Using default user (id: 1) for development'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in development mode registration', error });
  }
});

/**
 * @swagger
 * /api/users/login:
 *   post:
 *     summary: Login a user (Development Mode)
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *                 format: email
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *       400:
 *         description: Invalid input
 *       401:
 *         description: Invalid email or password
 *       500:
 *         description: Server error
 */
router.post('/login', validateLogin, handleValidationErrors, async (req: Request, res: Response) => {
  try {
    // In development mode, always return success with default user token
    const devToken = 'dev-mode-token';
    res.json({ 
      message: 'Development Mode: Login successful', 
      token: devToken,
      userId: 1,
      note: 'Using default user (id: 1) for development'
    });
  } catch (error) {
    res.status(500).json({ message: 'Error in development mode login', error });
  }
});

export default router;
