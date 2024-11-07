import {ErrorType} from "../types";

export class DocumentNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.DOCUMENT_NOT_FOUND}) Document not found.`);
        this.name = 'DocumentNotFoundError';
    }
}

export class DocumentAlreadyApprovedError extends Error {
    constructor() {
        super(`(${ErrorType.DOCUMENT_ALREADY_APPROVED}) Document already approved.`);
        this.name = 'DocumentAlreadyApprovedError';
    }
}

export class CallerIsTheUploaderError extends Error {
    constructor() {
        super(`(${ErrorType.CALLER_IS_THE_UPLOADER}) Caller is the uploader.`);
        this.name = 'CallerIsTheUploaderError';
    }
}
