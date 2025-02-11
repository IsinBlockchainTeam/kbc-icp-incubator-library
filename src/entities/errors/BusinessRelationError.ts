export class BusinessRelationNotFoundError extends Error {
    constructor() {
        super(`Business relation not found.`);
    }
}
