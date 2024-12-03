import { ErrorType } from "../types";

export class OrganizationNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.ORGANIZATION_NOT_FOUND}) Organization not found.`);
        this.name = "OrganizationNotFoundError";
    }
}
