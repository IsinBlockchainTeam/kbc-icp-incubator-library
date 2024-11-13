import {ErrorType} from "../types";

export class NotAuthenticatedError extends Error {
    constructor() {
        super(`(${ErrorType.NOT_AUTHENTICATED}) Access denied: user is not authenticated.`);
        this.name = 'NotAuthenticatedError';
    }
}
export class NotAuthorizedError extends Error {
    constructor() {
        super(`(${ErrorType.NOT_AUTHORIZED}) Access denied: user is not authorized to perform this action.`);
        this.name = 'NotAuthorizedError';
    }
}
export class NotValidCredentialError extends Error {
    constructor() {
        super(`(${ErrorType.NOT_VALID_CREDENTIAL}) Access denied: user has not provided valid credentials.`);
        this.name = 'NotValidCredentialError';
    }
}
