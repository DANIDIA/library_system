import express from 'express';
import { sessionsController } from '../index.js';

export const sessionsRouter = express.Router();

sessionsRouter.get('/login', sessionsController.login);
sessionsRouter.get('/logout', sessionsController.logout);
sessionsRouter.get('/is_session_ended');
