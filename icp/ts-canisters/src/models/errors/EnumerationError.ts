import { ErrorType } from '../types';

export class EnumerationAlreadyExistsError extends Error {
    constructor() {
        super(`(${ErrorType.ENUMERATION_ALREADY_EXISTS}) Enumeration value already exists.`);
        this.name = 'EnumerationAlreadyExistsError';
    }
}
export class EnumerationNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.ENUMERATION_NOT_FOUND}) Enumeration value does not exist.`);
        this.name = 'EnumerationNotFoundError';
    }
}
