import { ICPResourceSpec } from '@blockchain-lib/common';
import { ICPFileDriver } from '../../drivers/ICPFileDriver';
import { URLStructure } from '../../types/URLStructure';

export type Document = {
    referenceId: string;
    filename: string;
    fileType: string;
    fileContent: Uint8Array;
    storageConfig: {
        urlStructure: URLStructure;
        resourceSpec: ICPResourceSpec;
        delegatedOrganizationIds: number[];
    };
};

export class DocumentService {
    private readonly _icpFileDriver: ICPFileDriver;

    constructor(icpFileDriver: ICPFileDriver) {
        this._icpFileDriver = icpFileDriver;
    }

    async getDocumentContent(externalUrl: string): Promise<Uint8Array> {
        try {
            return await this._icpFileDriver.read(externalUrl);
        } catch (error) {
            throw new Error(`Error getting document content: ${error}`);
        }
    }
}
