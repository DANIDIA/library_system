import { sessionStatus } from '../enums/index.js';
import { getSessionStatus, getUserBySession } from './database.js';

export async function authenticate (sessionID) {
    const status = await getSessionStatus(sessionID);

    if (status === sessionStatus.IS_ENDED) {
        throw new Error('Session is ended');
    } else if (status === sessionStatus.NOT_EXIST) {
        throw new Error('Session not exist');
    }

    return await getUserBySession(sessionID);
}
