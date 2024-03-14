import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { IStorageMetadataDriver, OperationType } from './IStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';

export type SolidMetadataSpec = {
    // --- use these when there is no entire url resource because the resource has to be created first
    resourceName?: string,
    bcResourceId?: string,
    // ---
    entireResourceUrl?: string,
}

export class SolidMetadataDriver implements IStorageMetadataDriver<SolidMetadataSpec> {
    private readonly _solidDriver: SolidDriver;

    private readonly _sessionCredential?: SolidSessionCredential;

    constructor(serverBaseUrl: string, sessionCredential?: SolidSessionCredential) {
        this._solidDriver = new SolidDriver(serverBaseUrl);
        this._sessionCredential = sessionCredential;
    }

    async create(type: OperationType, value: any, metadataSpec?: SolidMetadataSpec): Promise<string> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        return this._solidDriver.create(
            {
                podName: this._sessionCredential.podName,
                relativeUrlPath: `${SolidUtilsService.defineRelativeResourcePath(type, metadataSpec?.bcResourceId)}${metadataSpec?.resourceName || ''}`,
                type: SolidResourceType.METADATA,
            },
            { metadata: value },
            this._sessionCredential,
        );
    }

    async read(type: OperationType, metadataSpec: SolidMetadataSpec): Promise<any> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');

        return this._solidDriver.read(
            {
                podName: this._sessionCredential.podName,
                relativeUrlPath: metadataSpec.entireResourceUrl || `${SolidUtilsService.defineRelativeResourcePath(type, metadataSpec.bcResourceId)}${metadataSpec.resourceName || ''}`,
                type: SolidResourceType.METADATA,
            },
            this._sessionCredential,
        );
    }
}
