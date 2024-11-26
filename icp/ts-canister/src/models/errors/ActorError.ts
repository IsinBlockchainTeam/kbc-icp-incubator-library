import {ErrorType} from "../types";

export class SameActorsError extends Error {
    constructor() {
        super(`(${ErrorType.SAME_ACTORS}) Actors are the same.`);
        this.name = 'SameActorsError';
    }
}
