import express from 'express';
import {
  createSessionController,
  endSessionController,
  getSessionStatusController,
} from '../index.js';
import { validateScheme } from '../middleware/index.js';
import { startSessionScheme } from '../schemas/index.js';

export const authenticationRouter = express.Router();

authenticationRouter.post(
  '/',
  validateScheme(startSessionScheme),
  createSessionController
);
authenticationRouter.get('/', getSessionStatusController);
authenticationRouter.delete('/', endSessionController);
