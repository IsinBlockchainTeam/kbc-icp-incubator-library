import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { DocumentStorage, IStorageDocumentDriver } from './IStorageDocumentDriver';
import { MetadataType } from './IStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';

export class SolidDocumentDriver implements IStorageDocumentDriver {
    private readonly _solidDriver: SolidDriver;

    private readonly _sessionCredential?: SolidSessionCredential;

    constructor(serverBaseUrl: string, sessionCredential?: SolidSessionCredential) {
        this._solidDriver = new SolidDriver(serverBaseUrl);
        this._sessionCredential = sessionCredential;
    }

    async create(type: MetadataType, documentStorage: DocumentStorage): Promise<string> {
        return this._solidDriver.create(
            { relativeUrlPath: SolidUtilsService.defineRelativeResourcePath(type, documentStorage.resourceId), type: SolidResourceType.FILE },
            { value: documentStorage.fileBuffer },
            this._sessionCredential,
        );
    }
}
