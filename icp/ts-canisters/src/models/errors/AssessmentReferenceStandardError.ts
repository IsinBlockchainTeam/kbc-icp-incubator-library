import { ErrorType } from '../types';

export class AssessmentReferenceStandardNotFoundError extends Error {
    constructor(id: bigint) {
        super(`(${ErrorType.ASSESSMENT_REFERENCE_STANDARD_NOT_FOUND}) Assessment reference standard with id ${id} not found.`);
        this.name = 'AssessmentReferenceStandardNotFoundError';
    }
}
