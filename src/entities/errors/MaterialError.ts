export class MaterialNotFoundError extends Error {
    constructor() {
        super(`Material not found.`);
    }
}
