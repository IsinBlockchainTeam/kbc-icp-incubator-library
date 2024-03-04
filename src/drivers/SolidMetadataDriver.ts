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
        return this._solidDriver.create(
            { relativeUrlPath: SolidUtilsService.defineRelativeResourcePath(type, metadataStorage.resourceId), type: SolidResourceType.METADATA },
            { metadata: metadataStorage.metadata },
            this._sessionCredential,
        );
    }
}
