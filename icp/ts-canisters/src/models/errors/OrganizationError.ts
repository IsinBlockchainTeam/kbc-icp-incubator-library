import { ErrorType } from '../types';

export class OrganizationNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.ORGANIZATION_NOT_FOUND}) Organization not found.`);
        this.name = 'OrganizationNotFoundError';
    }
}

export class InvalidIndustrialSectorError extends Error {
    constructor() {
        super(`(${ErrorType.INDUSTRIAL_SECTOR_INVALID}) Invalid industrial sector.`);
        this.name = 'InvalidIndustrialSectorError';
    }
}
