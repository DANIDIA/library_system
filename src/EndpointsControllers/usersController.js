import { DefaultController } from './defaultController.js';

class UserController extends DefaultController {
    constructor () {
        const searchableFields = [];
        const updatableFields = [];
        super(updatableFields, searchableFields);
    }
}

export const userController = new UserController();
