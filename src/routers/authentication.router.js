import express from 'express';
import {
  createSessionController,
  endSessionController,
  getSessionStatusController,
} from '../index.js';
import { validateScheme } from '../middleware/index.js';
import { createSessionScheme } from '../schemas/index.js';

export const authenticationRouter = express.Router();

authenticationRouter.post(
  '/',
  validateScheme(createSessionScheme),
  createSessionController
);

authenticationRouter.get('/', getSessionStatusController);

authenticationRouter.delete('/', endSessionController);
