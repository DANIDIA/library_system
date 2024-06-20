import sql from 'mysql-bricks';
import { dbTablesNamesEnum, rolesEnum } from '../shared/index.js';
import { connection } from '../helpers/index.js';

export async function newActualManagerValidator(managerID, response) {
  const query = sql
    .select()
    .from(dbTablesNamesEnum.EMPLOYEES)
    .where(sql.eq('id', managerID))
    .toParams({ placeholder: '?' });

  const user = (await connection.query(query.text, query.values))[0][0];

  if (!user || user.role !== rolesEnum.DEPARTMENT_MANAGER) {
    response.status().send();
    return false;
  } else if (user.departmentID !== null) {
    response.status().send();
    return false;
  }

  return true;
}
