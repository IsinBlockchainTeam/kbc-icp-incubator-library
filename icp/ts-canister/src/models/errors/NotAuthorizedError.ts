import {ErrorType} from "../types";

export class NotAuthorizedError extends Error {
    constructor() {
        super(`(${ErrorType.NOT_AUTHORIZED}) Access denied: user is not authorized to perform this action.`);
        this.name = 'NotAuthorizedError';
    }
}
