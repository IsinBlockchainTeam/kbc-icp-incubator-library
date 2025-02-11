import { ErrorType } from '../types';

export class AssetOperationNotFoundError extends Error {
    constructor() {
        super(`(${ErrorType.ASSET_OPERATION_NOT_FOUND}) Asset operation not found.`);
        this.name = 'AssetOperationNotFoundError';
    }
}
