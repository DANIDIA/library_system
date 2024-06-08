import { defineSchemeField } from './helpers/defineSchemeField.js';
import { schemeFieldTypesEnum } from './shared/schemeFieldTypesEnum.js';

/**
 * @swagger
 *
 * components:
 *   schemas:
 *     createSessionRequestBody:
 *       type: object
 *       required:
 *         - login
 *         - password
 *       properties:
 *         login:
 *           type: string
 *           default: JacekKowalski
 *         password:
 *           type: string
 *           default: 45H_u87ER-d
 *     createSessionHeaders:
 *       Set-Cookie:
 *         description: Set sessionID cookie
 *         schema:
 *           type: string
 *     createSessionResponseBody:
 *       type: object
 *       required:
 *         - name
 *         - surname
 *         - role
 *         - phoneNumber
 *         - email
 *         - status
 *         - departmentID
 *       properties:
 *         name:
 *           type: string
 *           default: Jacek
 *         surname:
 *           type: string
 *           default: Kowalski
 *         role:
 *           type: number
 *           default: 3
 *         phoneNumber:
 *           type: string
 *           default: +48958675867
 *         email:
 *           type: string
 *           default: jacek.kowalski@example.com
 *         status:
 *           type: boolean
 *           default: 1
 *         departmentID:
 *           type: number
 *           default: 9
 * */

export const createSessionScheme = Object.freeze({
  login: defineSchemeField(schemeFieldTypesEnum.STRING),
  password: defineSchemeField(schemeFieldTypesEnum.STRING),
});
