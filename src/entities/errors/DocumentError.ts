export class DocumentNotFoundError extends Error {
    constructor() {
        super(`Document not found.`);
    }
}

export class DocumentAlreadyApprovedError extends Error {
    constructor() {
        super(`Document already approved.`);
    }
}

export class CallerIsTheUploaderError extends Error {
    constructor() {
        super(`Caller is the uploader.`);
    }
}
