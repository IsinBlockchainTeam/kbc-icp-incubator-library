import { SolidDriver, SolidResourceType, SolidSessionCredential } from '@blockchain-lib/common';
import { IStorageDocumentDriver } from './IStorageDocumentDriver';
import { OperationType } from './IStorageMetadataDriver';
import { SolidUtilsService } from '../services/SolidUtilsService';

export type SolidDocumentSpec = {
    // --- use these when there is no entire url resource because the resource has to be created first
    filename?: string,
    bcResourceId?: string
    // ---
    entireResourceUrl?: string,
}

export class SolidDocumentDriver implements IStorageDocumentDriver<SolidDocumentSpec> {
    private readonly _solidDriver: SolidDriver;

    private readonly _sessionCredential?: SolidSessionCredential;

    constructor(serverBaseUrl: string, sessionCredential?: SolidSessionCredential) {
        this._solidDriver = new SolidDriver(serverBaseUrl);
        this._sessionCredential = sessionCredential;
    }

    async create(type: OperationType, value: Buffer, documentSpec: SolidDocumentSpec): Promise<string> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        if (!documentSpec.filename) throw new Error('Missing document filename');
        return this._solidDriver.create(
            {
                podName: this._sessionCredential.podName,
                relativeUrlPath: `${SolidUtilsService.defineRelativeResourcePath(type, documentSpec.bcResourceId)}${documentSpec.filename}`,
                type: SolidResourceType.FILE,
            },
            {
                value,
            },
            this._sessionCredential,
        );
    }

    async read(type: OperationType, documentSpec: SolidDocumentSpec): Promise<Buffer | null> {
        if (!this._sessionCredential?.podName) throw new Error('Invalid or missing session credential, podName is required.');
        const resource = await this._solidDriver.read(
            {
                podName: this._sessionCredential.podName,
                relativeUrlPath: documentSpec.entireResourceUrl || `${SolidUtilsService.defineRelativeResourcePath(type, documentSpec.bcResourceId)}${documentSpec.filename}`,
                type: SolidResourceType.FILE,
            },
            this._sessionCredential,
        );
        return resource?.value ? resource.value as Buffer : null;
    }
}
