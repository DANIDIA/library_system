import passwordGenerator from 'generate-password';
import {
  accountStatusesEnum,
  dbTablesNamesEnum,
  rolesEnum,
} from '../shared/index.js';
import {
  changeRecordData,
  connection,
  createRecord,
  endAllUserSessions,
  getDepartmentByID,
  getUserBySession,
  increaseEmployeeAmountByOne,
  increaseValueBy,
  queryRecords,
} from '../helpers/index.js';
import { getSchemeFields } from './helpers.js';
import {
  defaultUsersScheme,
  queryUsersScheme,
  updateUserScheme,
} from '../schemas/users.shemas.js';
import sql from 'mysql-bricks';
import { usersResourceFieldsNames } from './shared/index.js';

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

export async function queryUsersController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, queryUsersScheme);
    const valuesToQuery = { ...scheme.query };
    delete valuesToQuery.pageSize;
    delete valuesToQuery.pageNumber;

    const author = await getUserBySession(req.cookies.sessionID);

    if (author.role === rolesEnum.DEPARTMENT_MANAGER) {
      if (!Object.hasOwn(scheme.query, 'role')) {
        res.statusMessage =
          "You don't have permission to see data of all users, specify role";
        return res.status(403).send();
      }
      if (!Object.hasOwn(scheme.query, 'departmentID')) {
        res.statusMessage =
          "You don't have permission to see data of all users, specify departmentID";
        return res.status(403).send();
      }
    }

    const results = await queryUsers(valuesToQuery);

    res.status(200).send({
      allResultsAmount: results.length,
      results: paginateValues(scheme, results),
    });
  } catch (e) {
    next(e);
  }
}

export async function updateUserController(req, res, next) {
  try {
    const scheme = getSchemeFields(req, updateUserScheme);
    const author = await getUserBySession(req.cookies.sessionID);
    const userID = req.params.id;
    const user = await getUserByID(userID);
    const userDepartmentID = user.departmentID;
    const putDepartmentID = scheme.body.departmentID;
    const putDepartment = await getDepartmentByID(putDepartmentID);

    const isChangingRole = scheme.body.role !== user.role;
    const isChangingDepartment = user.departmentID !== scheme.body.departmetnID;
    const isPuttingManager = scheme.body.role === rolesEnum.DEPARTMENT_MANAGER;

    if (
      rolePermissionLevel[author.role] <= rolePermissionLevel[user.role] ||
      rolePermissionLevel[author.role] <= rolePermissionLevel[scheme.body.role]
    ) {
      res.statusMessage =
        "You don't have permission to manipulate with users with your permission level or higher";
      return res.status(403).send();
    }

    if (
      (isChangingRole || isChangingDepartment) &&
      isPuttingManager &&
      putDepartment?.actualManagerID !== null
    ) {
      res.statusMessage = `Department with id '${putDepartmentID}' has already department manager`;
      return res.status(406).send();
    }

    await updateUser(userID, scheme.body);

    if (scheme.body.status === accountStatusesEnum.BLOCKED) {
      await endAllUserSessions(userID);
    }

    if (
      (isChangingRole && scheme.body.role === rolesEnum.LIBRARIAN) ||
      (isChangingDepartment && isPuttingManager && !isChangingRole)
    ) {
      await setManagerInDepartment(userDepartmentID, sql('null'));
    }

    if (isPuttingManager && (isChangingRole || isChangingDepartment)) {
      await setManagerInDepartment(putDepartmentID, userID);
    }

    if (user.departmentID !== scheme.body.departmentID) {
      await decreaseEmployeesAmountByOne(userDepartmentID);
      await increaseEmployeeAmountByOne(putDepartmentID);
    }

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

async function setActualDepartmentManager(actualManagerID, departmentID) {
  await changeRecordData(departmentID, dbTablesNamesEnum.DEPARTMENTS, {
    actualManagerID,
  });
}

async function checkAuthorRolePermission(authorID, roleTryingToSet, res) {
  const author = await getUserBySession(authorID);

  if (rolePermissionLevel[author.role] < rolePermissionLevel[roleTryingToSet]) {
    res.statusMessage =
      "You don't have permission to manipulate with users with permission level manager or higher";
    res.status(403).send();
    return false;
  }

  return true;
}

function paginateValues(scheme, values) {
  if (
    !Object.hasOwn(scheme.query, 'pageSize') ||
    !Object.hasOwn(scheme.query, 'pageNumber')
  ) {
    return values;
  }

  const pageSize = scheme.query.pageSize;
  const pageNumber = scheme.query.pageNumber;

  return values.slice(pageSize * pageNumber, pageSize * (pageNumber + 1));
}

async function queryUsers(valuesToQuery) {
  const query = sql
    .select(usersResourceFieldsNames)
    .from(dbTablesNamesEnum.EMPLOYEES)
    .where(
      sql.and([
        ...Object.entries(valuesToQuery).map((entry) =>
          sql.eq(entry[0], entry[1])
        ),
        sql.notEq('role', rolesEnum.ADMIN),
      ])
    )
    .toParams({ placeholder: '?' });

  return (await connection.qeury(query.text, query.values))[0];
}

async function getUserByID(id) {
  return (await queryRecords(dbTablesNamesEnum.EMPLOYEES, { id }))[0];
}

const rolePermissionLevel = Object.freeze({
  [rolesEnum.ADMIN]: 3,
  [rolesEnum.DEPARTMENT_MANAGER]: 2,
  [rolesEnum.LIBRARIAN]: 1,
});

async function decreaseEmployeesAmountByOne(departmentID) {
  await increaseValueBy(
    dbTablesNamesEnum.DEPARTMENTS,
    departmentID,
    'employeesAmount',
    -1
  );
}

async function updateUser(id, data) {
  await changeRecordData(id, dbTablesNamesEnum.EMPLOYEES, data);
}

async function setManagerInDepartment(id, managerID) {
  await changeRecordData(id, dbTablesNamesEnum.DEPARTMENTS, {
    actualManagerID: managerID,
  });
}
