import sql from 'mysql-bricks';
import { connection, recordExist } from '../helpers/index.js';
import { accountStatusesEnum, dbTablesNamesEnum } from '../shared/index.js';

class AuthenticationController {
  async login(req, res, next) {
    try {
      const queryCheck = sql
        .select()
        .from(dbTablesNamesEnum.EMPLOYEES)
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

      if (users[0].isActive === accountStatusesEnum.BLOCKED) {
        return res.status(403).send('Forbidden');
      }

      const queryInsertSession = sql
        .insert(dbTablesNamesEnum.ACTIVE_SESSIONS)
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
        .delete(dbTablesNamesEnum.ACTIVE_SESSIONS)
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

      const result = !(await recordExist(
        id,
        dbTablesNamesEnum.ACTIVE_SESSIONS
      ));

      res.status(200).json({ isEnded: result });
    } catch (e) {
      next(e);
    }
  }
}

export const authenticationController = new AuthenticationController();
