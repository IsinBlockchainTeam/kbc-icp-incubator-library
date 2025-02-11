import { CertificateTypeEnum, ErrorType } from '../types';

export class EvaluationStatusError extends Error {
    constructor() {
        super(`(${ErrorType.EVALUATION_STATUS_INVALID}) Invalid evaluation status.`);
        this.name = 'EvaluationStatusError';
    }
}

export class CertificateNotFoundError extends Error {
    constructor(type?: CertificateTypeEnum) {
        super(`(${ErrorType.CERTIFICATE_NOT_FOUND}) ${type ? `${type} ` : ''}Certificate not found.`);
        this.name = 'CertificateNotFoundError';
    }
}

export class InvalidCertificateTypeError extends Error {
    constructor() {
        super(`(${ErrorType.CERTIFICATE_TYPE_INVALID}) Invalid certificate type.`);
        this.name = 'InvalidCertificateTypeError';
    }
}

export class CertificateTypeMismatchError extends Error {
    constructor() {
        super(`(${ErrorType.CERTIFICATE_TYPE_MISMATCH}) Certificate type mismatch with the ID provided.`);
        this.name = 'CertificateTypeMismatchError';
    }
}
