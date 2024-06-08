import express from 'express';
import { sessionsController } from '../index.js';
import { validateScheme } from '../middleware/index.js';
import { startSessionScheme } from '../schemas/index.js';

export const sessionsRouter = express.Router();

sessionsRouter.post(
  '/',
  validateScheme(startSessionScheme),
  sessionsController.login
);
sessionsRouter.get('/', sessionsController.isSessionEnded);
sessionsRouter.delete('/', sessionsController.logout);
