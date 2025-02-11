export class MaterialNotFoundError extends Error {
    constructor() {
        super(`Material not found.`);
    }
}
export class MaterialNotValidError extends Error {
    constructor() {
        super(`Material not valid.`);
    }
}
