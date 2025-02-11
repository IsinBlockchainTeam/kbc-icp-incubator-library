import {ErrorType} from "../types";

export class EmailNotSentError extends Error {
    constructor() {
        super(`(${ErrorType.EMAIL_NOT_SENT}) Email not sent.`);
        this.name = 'EmailNotSentError';
    }
}
