export class EmailError extends Error {
    constructor() {
        super(`Email not valid.`);
    }
}
