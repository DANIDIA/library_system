import express from 'express';
import {
  createDepartmentController,
  deleteDepartmentController,
  updateDepartmentController,
} from '../controllers/index.js';
import { adminOnlyRule } from '../accessRules/index.js';
import { authenticate, validateScheme } from '../middleware/index.js';
import {
  defaultDepartmentScheme,
  queryDepartmentScheme,
  departmentDataAccessScheme,
  updateDepartmentScheme,
} from '../schemas/index.js';

export const departmentsRouter = express.Router();

departmentsRouter.use(authenticate);

departmentsRouter.post(
  '/',
  adminOnlyRule(),
  validateScheme(defaultDepartmentScheme),
  createDepartmentController
);
departmentsRouter.get(
  '/',
  validateScheme(queryDepartmentScheme),
  queryDepartmentsController
);
departmentsRouter.put(
  '/:id',
  // forManagerRule('id'),
  validateScheme(updateDepartmentScheme),
  updateDepartmentController
);
departmentsRouter.delete(
  '/:id',
  adminOnlyRule(),
  validateScheme(departmentDataAccessScheme),
  deleteDepartmentController
);
