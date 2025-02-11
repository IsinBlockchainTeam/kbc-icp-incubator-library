import { ErrorType } from '../types';
import { EnumerationType } from '../../services/EnumerationService';

export class EnumerationAlreadyExistsError extends Error {
    constructor(type: EnumerationType) {
        super(`(${ErrorType.ENUMERATION_ALREADY_EXISTS}) ${type} value already exists.`);
        this.name = 'EnumerationAlreadyExistsError';
    }
}
export class EnumerationNotFoundError extends Error {
    constructor(type: EnumerationType) {
        super(`(${ErrorType.ENUMERATION_NOT_FOUND}) ${type} value does not exist.`);
        this.name = 'EnumerationNotFoundError';
    }
}
