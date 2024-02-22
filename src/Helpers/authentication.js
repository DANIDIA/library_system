import { role } from './role.js';
import { getSessionStatus, getUserBySession } from './database.js';
import { sessionStatus } from './sessionStatus.js';

export function authenticate (endpointHandler, allowedRoles = [role.ADMIN, role.DEPARTMENT_MANAGER, role.LIBRARIAN]) {
    return async (request, response) => {
        try {
            const sessionID = request.body.sessionID;
            const status = await getSessionStatus(sessionID);

            if (status === sessionStatus.IS_ENDED) {
                response.status(500).json('Session is ended');
                return;
            }
            if (status === sessionStatus.NOT_EXIST) {
                response.status(500).json('Session not exist');
                return;
            }

            const user = await getUserBySession(sessionID);

            if (!allowedRoles.includes(user.role)) {
                response.status(500).json('Does not have permission');
                return;
            }

            endpointHandler(request, response, user);
        } catch (e) {
            response.status(500).json('oops...');
            console.log(e);
        }
    };
}
