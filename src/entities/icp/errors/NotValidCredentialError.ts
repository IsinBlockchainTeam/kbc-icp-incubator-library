export class NotValidCredentialError extends Error {
    constructor() {
        super('Access denied: user has not provided valid credentials.');
    }
}
