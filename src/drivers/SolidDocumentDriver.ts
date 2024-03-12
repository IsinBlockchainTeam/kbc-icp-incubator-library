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
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        return this._solidDriver.create(
            {
                podName: this._sessionCredential.podName,
                relativeUrlPath: `${SolidUtilsService.defineRelativeResourcePath(type, documentStorage.bcResourceId)}${documentStorage.filename}`,
                type: SolidResourceType.FILE,
            },
            {
                value: documentStorage.fileBuffer,
            },
            this._sessionCredential,
        );
    }
}
