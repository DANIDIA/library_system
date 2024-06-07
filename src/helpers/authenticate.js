import { sessionStatusesRole } from '../enums/index.js';
import { getSessionStatus } from './helperDBFunctions.js';

export async function authenticate(req, res, next) {
  const sessionID = req.body.sessionID || req.query.sessionID;
  const status = await getSessionStatus(sessionID);

  if (status === sessionStatusesRole.NOT_EXIST) {
    return res.status(403).send('Session not exist');
  }

  next();
}
