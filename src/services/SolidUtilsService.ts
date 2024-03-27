import { v4 as uuidv4 } from 'uuid';
import { composeWebId } from '@blockchain-lib/common';
import { StorageOperationType } from '../types/StorageOperationType';

export class SolidUtilsService {
    static defineRelativeResourcePath(serverBaseUrl: string, podName: string, type: StorageOperationType, id?: string) {
        const randomId = id || uuidv4();
        const podUrl = composeWebId([serverBaseUrl, podName]);
        switch (type) {
        case StorageOperationType.TRANSACTION:
            return `${podUrl}/transactions/${randomId}/`;
        case StorageOperationType.TRANSACTION_DOCUMENT:
            return `${podUrl}/transactions/${randomId}/documents/`;
        case StorageOperationType.CERTIFICATION_DOCUMENT:
            return `${podUrl}/transactions/${randomId}/certifications/`;
        default:
            throw new Error('Invalid resource type');
        }
    }
}
