export class NotAuthorizedError extends Error {
    constructor() {
        super('Access denied: user is not authorized to perform this action.');
    }
}
