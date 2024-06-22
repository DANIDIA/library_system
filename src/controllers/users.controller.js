import passwordGenerator from 'generate-password';
import { DefaultController } from './default.controller.js';
import { dbTablesNamesEnum, rolesEnum } from '../shared/index.js';
import {
  changeRecordData,
  createRecord,
  getDepartmentByID,
  getUserBySession,
  increaseEmployeeAmountByOne,
  recordExist,
} from '../helpers/index.js';
import {
  validateEmail,
  validatePhoneNumber,
} from '../helpers/contactDetailsValidators.js';
import { getSchemeFields } from './helpers.js';
import { defaultUsersScheme } from '../schemas/users.shemas.js';
import sql from 'mysql-bricks';

export async function createUserController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, defaultUsersScheme);

    if (
      await checkAuthorRolePermission(
        req.cookies.sessionID,
        scheme.body.role,
        res
      )
    ) {
      return;
    }

    const login = req.body.name + req.body.surname;
    const password = passwordGenerator.generate({
      length: 10,
      numbers: true,
      uppercase: true,
      lowercase: true,
    });

    const departmentID = scheme.body.departmentID;
    const department = await getDepartmentByID(scheme.body.departmentID);

    const isSetNewActualDepartmentManager =
      departmentID !== null &&
      scheme.body.role === rolesEnum.DEPARTMENT_MANAGER;

    if (isSetNewActualDepartmentManager && department.actualMangerID !== null) {
      res.statusMessage = `Department with id ${departmentID} already has department manager`;
      return res.status(409).send();
    }

    const id = await createRecord(dbTablesNamesEnum.EMPLOYEES, {
      ...scheme.body,
      login,
      password,
      additionDate: sql('NOW()'),
    });

    if (isSetNewActualDepartmentManager) {
      await increaseEmployeeAmountByOne(departmentID);
      await setActualDepartmentManager(id, departmentID);
    }

    if (scheme.body.role !== rolesEnum.DEPARTMENT_MANAGER) {
      await increaseEmployeeAmountByOne(departmentID);
    }

    res.status(201).send({ id });
  } catch (e) {
    next(e);
  }
}

class UsersController extends DefaultController {
  constructor() {
    const searchableFields = [
      'name',
      'surname',
      'role',
      'phoneNumber',
      'email',
      'login',
      'departmentID',
    ];
    const updatableFields = [
      'name',
      'surname',
      'phoneNumber',
      'email',
      'login',
      'password',
      'departmentID',
    ];
    super(dbTablesNamesEnum.EMPLOYEES, updatableFields, searchableFields);
  }

  get() {
    return async (req, res, next) => {
      try {
        await super.get(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  update() {
    return async (req, res, next) => {
      try {
        if (
          Object.hasOwn(req.body, 'departmentID') &&
          !(await recordExist(
            req.body.departmentID,
            dbTablesNamesEnum.DEPARTMENTS
          ))
        ) {
          return res
            .status(404)
            .send(`Department with id ${req.body.departmentID} doesn't exist`);
        }

        if (validateEmail(req, res) || validatePhoneNumber(req, res)) {
          return;
        }

        await super.update(req, res);
      } catch (e) {
        next(e);
      }
    };
  }

  changeStatus() {
    return async (req, res, next) => {
      try {
        await super.changeStatus(req, res);
      } catch (e) {
        next(e);
      }
    };
  }
}

export const usersController = new UsersController();

async function setActualDepartmentManager(actualManagerID, departmentID) {
  await changeRecordData(departmentID, dbTablesNamesEnum.DEPARTMENTS, {
    actualManagerID,
  });
}

async function checkAuthorRolePermission(authorID, roleTryingToSet, res) {
  const author = await getUserBySession(authorID);

  if (
    author.role === rolesEnum.DEPARTMENT_MANAGER &&
    roleTryingToSet !== rolesEnum.LIBRARIAN
  ) {
    res.statusMessage =
      "You don't have permission to manipulate with users with permission level manager or higher";
    res.status(403).send();
    return false;
  }

  return true;
}
