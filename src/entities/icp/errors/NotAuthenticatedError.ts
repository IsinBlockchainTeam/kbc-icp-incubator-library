export class NotAuthenticatedError extends Error {
    constructor() {
        super('Access denied: user is not authenticated.');
    }
}
