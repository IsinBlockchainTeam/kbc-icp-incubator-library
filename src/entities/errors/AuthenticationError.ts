export class NotAuthenticatedError extends Error {
    constructor() {
        super('Access denied: user is not authenticated.');
    }
}
export class NotAuthorizedError extends Error {
    constructor() {
        super('Access denied: user is not authorized to perform this action.');
    }
}
export class NotValidCredentialError extends Error {
    constructor() {
        super('Access denied: user has not provided valid credentials.');
    }
}
export class NotControllerError extends Error {
    constructor() {
        super('Access denied: user is not the controller of the canister.');
    }
}
