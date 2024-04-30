import express from 'express';
import { authenticate } from '../helpers/index.js';
import { departmentsController } from '../endpointsControllers/index.js';
import { adminOnlyRule, forManagerRule } from '../accessRules/index.js';

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
departmentsRouter.put(
  '/remove',
  adminOnlyRule(),
  departmentsController.remove()
);
