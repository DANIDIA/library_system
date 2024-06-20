import { sessionStatusesRole } from '../shared/index.js';
import { getSessionStatus } from '../helpers/index.js';

export async function authenticate(req, res, next) {
  const sessionID = req.cookies.sessionID;
  const status = await getSessionStatus(sessionID);

  if (status === sessionStatusesRole.NOT_EXIST) {
    res.statusMessage = `Session with ID '${sessionID}' doesn't exist`;
    return res.status(403).send();
  }

  next();
}
