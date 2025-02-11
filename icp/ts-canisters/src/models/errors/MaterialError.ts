import {ErrorType} from "../types";

export class MaterialNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.MATERIAL_NOT_FOUND}) Material not found.`);
        this.name = 'MaterialNotFoundError';
    }
}
export class MaterialNotValid extends Error {
    constructor() {
        super(`(${ErrorType.MATERIAL_NOT_VALID}) Material not valid.`);
        this.name = 'MaterialNotValid';
    }
}
