import {
    SolidDriver,
    SolidResourceType,
    SolidSessionCredential,
} from '@blockchain-lib/common';
import { DocumentSpec, ISolidStorageDocumentDriver } from './ISolidStorageDocumentDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';
import { StorageOperationType } from '../types/StorageOperationType';

export interface SolidDocumentSpec extends DocumentSpec {
    // --- use these when there is no entire url resource because the resource has to be created first
    filename?: string,
    bcResourceId?: string
    // ---
    entireResourceUrl?: string,
}

export class SolidDocumentDriver implements ISolidStorageDocumentDriver<SolidDocumentSpec> {
    private readonly _solidDriver: SolidDriver;

    private readonly _solidServerBaseUrl: string;

    private readonly _sessionCredential?: SolidSessionCredential;

    constructor(serverBaseUrl: string, sessionCredential?: SolidSessionCredential) {
        this._solidServerBaseUrl = serverBaseUrl;
        this._solidDriver = new SolidDriver(this._solidServerBaseUrl);
        this._sessionCredential = sessionCredential;
    }

    async create(type: StorageOperationType, value: Buffer, documentSpec: SolidDocumentSpec): Promise<string> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        if (!documentSpec.filename) throw new Error('Missing document filename');

        const resource = await this._solidDriver.create(
            {
                totalUrlPath: `${SolidUtilsService.defineRelativeResourcePath(this._solidServerBaseUrl, this._sessionCredential.podName, type, documentSpec.bcResourceId)}${documentSpec.filename}`,
                type: SolidResourceType.FILE,
            },
            {
                value,
            },
            this._sessionCredential,
        );
        return resource.totalUrlPath;
    }

    async read(type: StorageOperationType, documentSpec: SolidDocumentSpec): Promise<Buffer | null> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        const resource = await this._solidDriver.read(
            {
                totalUrlPath: documentSpec.entireResourceUrl || `${SolidUtilsService.defineRelativeResourcePath(this._solidServerBaseUrl, this._sessionCredential.podName, type, documentSpec.bcResourceId)}${documentSpec.filename}`,
                type: SolidResourceType.FILE,
            },
            this._sessionCredential,
        );
        return resource?.value ? resource.value as Buffer : null;
    }
}
