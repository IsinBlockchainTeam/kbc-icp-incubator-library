import {ErrorType} from "../types";

export class NotAuthenticatedError extends Error {
    constructor() {
        super(`(${ErrorType.NOT_AUTHENTICATED}) Access denied: user is not authenticated.`);
        this.name = 'NotAuthenticatedError';
    }
}
