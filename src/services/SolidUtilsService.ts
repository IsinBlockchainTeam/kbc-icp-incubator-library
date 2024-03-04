import { v4 as uuidv4 } from 'uuid';
import { MetadataType } from '../drivers/IStorageMetadataDriver';

export enum ResourceType {
    TRANSACTION, TRANSACTION_DOCUMENT, CERTIFICATION_DOCUMENT
}

export class SolidUtilsService {
    static defineRelativeResourcePath(type: MetadataType, id?: string) {
        const randomId = id || uuidv4();
        switch (type) {
        case MetadataType.TRANSACTION:
            return `/transactions/${randomId}/`;
        case MetadataType.TRANSACTION_DOCUMENT:
            return `/transactions/${randomId}/documents/`;
        case MetadataType.CERTIFICATION_DOCUMENT:
            return `/transactions/${randomId}/certifications/`;
        default:
            throw new Error('Invalid resource type');
        }
    }
}
