import sql from 'mysql-bricks';
import { connection, recordExist } from '../helpers/index.js';
import { accountStatus, dbTablesNames } from '../enums/index.js';

class SessionsController {
  async login(req, res, next) {
    try {
      const queryCheck = sql
        .select()
        .from(dbTablesNames.EMPLOYEES)
        .where(
          sql.and(
            sql.eq('login', req.body.login),
            sql.eq('password', req.body.password)
          )
        )
        .toParams({ placeholder: '?' });

      const users = (
        await connection.query(queryCheck.text, queryCheck.values)
      )[0];

      if (users.length <= 0) {
        return res.status(401).send('Unauthorized');
      }

      if (users[0].isActive === accountStatus.BLOCKED) {
        return res.status(403).send('Forbidden');
      }

      const queryInsertSession = sql
        .insert(dbTablesNames.ACTIVE_SESSIONS)
        .values({
          employeeID: users[0].id,
          start: sql('NOW()'),
        })
        .toParams({ placeholder: '?' });

      const value = (
        await connection.query(
          queryInsertSession.text,
          queryInsertSession.values
        )
      )[0];

      const userData = { ...users[0] };
      delete userData.login;
      delete userData.password;

      res.status(200).json({ sessionID: value.insertId, ...userData });
    } catch (e) {
      next(e);
    }
  }

  async logout(req, res, next) {
    try {
      const id = req.body.id;

      const query = sql
        .delete(dbTablesNames.ACTIVE_SESSIONS)
        .where(sql.eq('id', id))
        .toParams({ placeholder: '?' });

      await connection.query(query.text, query.values);

      res.status(200).send('ok');
    } catch (e) {
      next(e);
    }
  }

  async isSessionEnded(req, res, next) {
    try {
      const id = req.query.id;

      const result = !(await recordExist(id, dbTablesNames.ACTIVE_SESSIONS));

      res.status(200).json({ isEnded: result });
    } catch (e) {
      next(e);
    }
  }
}

export const sessionsController = new SessionsController();
