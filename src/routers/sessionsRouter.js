import express from 'express';
import { sessionsController } from '../index.js';

export const sessionsRouter = express.Router();

sessionsRouter.post('/login', sessionsController.login);
sessionsRouter.put('/logout', sessionsController.logout);
sessionsRouter.post('/is_session_ended', sessionsController.isSessionEnded);
