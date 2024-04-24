import {
    SolidDriver,
    SolidResourceType,
    SolidSessionCredential,
    SolidStorageACR,
} from '@blockchain-lib/common';
import { ISolidStorageMetadataDriver, MetadataSpec } from './ISolidStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';
import { StorageOperationType } from '../types/StorageOperationType';

export interface SolidMetadataSpec extends MetadataSpec {
    // --- use these when there is no entire url resource because the resource has to be created first ---
    resourceName?: string,
    bcResourceId?: string,
    // ---------------------------------------------------------------------------------------------------
    entireResourceUrl?: string,
}

export class SolidMetadataDriver implements ISolidStorageMetadataDriver<SolidMetadataSpec, SolidStorageACR> {
    private readonly _solidDriver: SolidDriver;

    private readonly _solidServerBaseUrl: string;

    private readonly _sessionCredential?: SolidSessionCredential;

    constructor(serverBaseUrl: string, sessionCredential?: SolidSessionCredential) {
        this._solidServerBaseUrl = serverBaseUrl;
        this._solidDriver = new SolidDriver(this._solidServerBaseUrl);
        this._sessionCredential = sessionCredential;
    }

    async create(type: StorageOperationType, value: any, aclRules?: SolidStorageACR[], metadataSpec?: SolidMetadataSpec): Promise<string> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        const resourceUrlPath = `${SolidUtilsService.defineRelativeResourcePath(this._solidServerBaseUrl, this._sessionCredential.podName, type, metadataSpec?.bcResourceId)}${metadataSpec?.resourceName || ''}`;
        const resource = await this._solidDriver.create(
            {
                totalUrlPath: resourceUrlPath,
                type: SolidResourceType.METADATA,
            },
            { metadata: value },
            this._sessionCredential,
        );
        if (aclRules && aclRules.length > 0)
            await this._solidDriver.setAcl(
                {
                    totalUrlPath: resourceUrlPath,
                    type: SolidResourceType.METADATA,
                },
                aclRules,
                this._sessionCredential,
            );

        return resource.totalUrlPath;
    }

    async read(type: StorageOperationType, metadataSpec: SolidMetadataSpec): Promise<any> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');

        const resource = await this._solidDriver.read(
            {
                totalUrlPath: metadataSpec.entireResourceUrl || `${SolidUtilsService.defineRelativeResourcePath(this._solidServerBaseUrl, this._sessionCredential.podName, type, metadataSpec?.bcResourceId)}${metadataSpec?.resourceName || ''}`,
                type: SolidResourceType.METADATA,
            },
            this._sessionCredential,
        );
        return resource?.metadata;
    }
}
