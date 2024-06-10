import express from 'express';
import {
  createSessionController,
  endSessionController,
  getSessionStatusController,
} from '../index.js';
import { validateScheme } from '../middleware/index.js';
import { createSessionScheme } from '../schemas/index.js';

export const authenticationRouter = express.Router();

/**
 * @swagger
 *
 * /auth:
 *   post:
 *     tags:
 *       - Authentication
 *     description: Authenticate user, send its data and sessionID in cookies
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/createSessionRequestBody'
 *     responses:
 *       200:
 *         description: Successfully authenticated
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/createSessionResponseBody'
 *       400:
 *         description: Bad request. Request does not have some fields or some values of fields are invalid
 *       401:
 *         description: Unauthorized. Invalid login or password
 *       403:
 *         description: Forbidden. Login and password are correct but user is blocked
 * */
authenticationRouter.post(
  '/',
  validateScheme(createSessionScheme),
  createSessionController
);

/**
 * @swagger
 *
 * /auth:
 *   get:
 *     tags:
 *       - Authentication
 *     description: Return session status
 *     responses:
 *       200:
 *         description: Successfully send session status
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/getSessionStatusResponseBody'
 * */
authenticationRouter.get('/', getSessionStatusController);

/**
 * @swagger
 *
 * /auth:
 *   delete:
 *     tags:
 *       - Authentication
 *     description: End session
 *     responses:
 *       200:
 *         description: Successfully end session
 *       404:
 *         description: Session doesn't exit or is ended
 * */
authenticationRouter.delete('/', endSessionController);
