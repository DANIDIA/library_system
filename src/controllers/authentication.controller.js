import sql from 'mysql-bricks';
import { connection, recordExist } from '../helpers/index.js';
import { accountStatusesEnum, dbTablesNamesEnum } from '../shared/index.js';

export async function createSessionController(req, res, next) {
  try {
    const user = await getUserBy(req.body.login, req.body.password);

    if (!user) {
      return res.status(401).send();
    }

    if (user.status === accountStatusesEnum.BLOCKED) {
      return res.status(403).send();
    }

    const sessionID = await createSession(user.id);

    const responseData = { ...user };
    delete responseData.login;
    delete responseData.password;

    res.cookie('sessionID', sessionID, { httpOnly: true });

    res.status(200).json(responseData);
  } catch (e) {
    next(e);
  }
}

export async function getSessionStatusController(req, res, next) {
  try {
    const id = req.cookies.sessionID;

    const result = await recordExist(id, dbTablesNamesEnum.ACTIVE_SESSIONS);

    res.status(200).json({ status: result });
  } catch (e) {
    next(e);
  }
}

export async function endSessionController(req, res, next) {
  try {
    const id = req.cookies.sessionID;

    const query = sql
      .delete(dbTablesNamesEnum.ACTIVE_SESSIONS)
      .where(sql.eq('id', id))
      .toParams({ placeholder: '?' });

    await connection.query(query.text, query.values);

    res.cookie('sessionID', '', { httpOnly: true, maxAge: -1 });

    res.status(200).send();
  } catch (e) {
    next(e);
  }
}

async function getUserBy(login, password) {
  const query = sql
    .select()
    .from(dbTablesNamesEnum.EMPLOYEES)
    .where(sql.and(sql.eq('login', login), sql.eq('password', password)))
    .toParams({ placeholder: '?' });

  return (await connection.query(query.text, query.values))[0][0];
}

async function createSession(employeeID) {
  const query = sql
    .insert(dbTablesNamesEnum.ACTIVE_SESSIONS)
    .values({
      employeeID: employeeID,
      start: sql('NOW()'),
    })
    .toParams({ placeholder: '?' });

  return (await connection.query(query.text, query.values))[0].insertId;
}
