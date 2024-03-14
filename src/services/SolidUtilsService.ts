import { v4 as uuidv4 } from 'uuid';
import { OperationType } from '../drivers/IStorageMetadataDriver';

export enum ResourceType {
    TRANSACTION, TRANSACTION_DOCUMENT, CERTIFICATION_DOCUMENT
}

export class SolidUtilsService {
    static defineRelativeResourcePath(type: OperationType, id?: string) {
        const randomId = id || uuidv4();
        switch (type) {
        case OperationType.TRANSACTION:
            return `/transactions/${randomId}/`;
        case OperationType.TRANSACTION_DOCUMENT:
            return `/transactions/${randomId}/documents/`;
        case OperationType.CERTIFICATION_DOCUMENT:
            return `/transactions/${randomId}/certifications/`;
        default:
            throw new Error('Invalid resource type');
        }
    }
}
