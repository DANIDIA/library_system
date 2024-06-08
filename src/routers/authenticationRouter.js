import express from 'express';
import { authenticationController } from '../index.js';
import { validateScheme } from '../middleware/index.js';
import { startSessionScheme } from '../schemas/index.js';

export const authenticationRouter = express.Router();

authenticationRouter.post(
  '/',
  validateScheme(startSessionScheme),
  authenticationController.login
);
authenticationRouter.get('/', authenticationController.isSessionEnded);
authenticationRouter.delete('/', authenticationController.logout);
