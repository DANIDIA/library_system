import { sessionStatus } from '../enums/index.js';
import { getSessionStatus } from './helperDBFunctions.js';

export async function authenticate(req, res, next) {
  const sessionID = req.body.sessionID || req.query.sessionID;
  const status = await getSessionStatus(sessionID);

  if (status === sessionStatus.NOT_EXIST) {
    return res.status(403).send('Session not exist');
  }

  next();
}
