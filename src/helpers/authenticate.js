import { sessionStatus } from '../enums/index.js';
import { getSessionStatus } from './helperDBFunctions.js';

export async function authenticate (req, res, next) {
    const sessionID = req.body.sessionID;
    const status = await getSessionStatus(sessionID);

    if (status === sessionStatus.IS_ENDED) { return res.status(400).send('Session ended'); }
    if (status === sessionStatus.NOT_EXIST) { return res.status(400).send('Session not exist'); }

    next();
}
