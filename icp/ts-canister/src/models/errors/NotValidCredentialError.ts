import {ErrorType} from "../types";

export class NotValidCredentialError extends Error {
    constructor() {
        super(`(${ErrorType.NOT_VALID_CREDENTIAL}) Access denied: user has not provided valid credentials.`);
        this.name = 'NotValidCredentialError';
    }
}
