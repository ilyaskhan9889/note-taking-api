import express from 'express';
import { body } from 'express-validator';
import { register, login } from '../controllers/authController.js';
import validate from '../middleware/validate.js';

const router = express.Router();

router.post(
  '/register',
  body('email').isEmail(),
  body('password').isLength({ min: 8 }),
  validate,
  register
);

router.post(
  '/login',
  body('email').isEmail(),
  body('password').notEmpty(),
  validate,
  login
);

export default router;
