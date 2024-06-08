import express from 'express';
import { departmentsController } from '../controllers/index.js';
import { adminOnlyRule, forManagerRule } from '../accessRules/index.js';
import { authenticate } from '../middleware/index.js';

export const departmentsRouter = express.Router();

departmentsRouter.use(authenticate);

departmentsRouter.post('/add', adminOnlyRule(), departmentsController.add());
departmentsRouter.get(
  '/get',
  forManagerRule('id'),
  departmentsController.get()
);
departmentsRouter.put(
  '/update',
  forManagerRule('id'),
  departmentsController.update()
);
departmentsRouter.delete(
  '/remove',
  adminOnlyRule(),
  departmentsController.remove()
);
