import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { IStorageMetadataDriver, MetadataStorage, MetadataType } from './IStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';

export class SolidMetadataDriver implements IStorageMetadataDriver {
    private readonly _solidDriver: SolidDriver;

    private readonly _sessionCredential?: SolidSessionCredential;

    constructor(serverBaseUrl: string, sessionCredential?: SolidSessionCredential) {
        this._solidDriver = new SolidDriver(serverBaseUrl);
        this._sessionCredential = sessionCredential;
    }

    async create(type: MetadataType, metadataStorage: MetadataStorage): Promise<string> {
        console.log('spec: ', { relativeUrlPath: SolidUtilsService.defineRelativeResourcePath(type, metadataStorage.bcResourceId), type: SolidResourceType.METADATA });
        console.log('metadata: ', { metadata: metadataStorage.metadata });
        console.log('sessionCredential: ', this._sessionCredential);
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        return this._solidDriver.create(
            {
                podName: this._sessionCredential.podName,
                relativeUrlPath: `${SolidUtilsService.defineRelativeResourcePath(type, metadataStorage.bcResourceId)}${metadataStorage.resourceName || ''}`,
                type: SolidResourceType.METADATA,
            },
            { metadata: metadataStorage.metadata },
            this._sessionCredential,
        );
    }
}
