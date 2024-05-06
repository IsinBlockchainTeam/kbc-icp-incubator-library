import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Document } from '../entities/Document';
import {ICPFileDriver} from "../drivers/ICPFileDriver";

export class DocumentService {
    private _documentDriver: DocumentDriver;

    private readonly _icpFileDriver: ICPFileDriver;

    constructor(documentDriver: DocumentDriver, icpFileDriver: ICPFileDriver) {
        this._documentDriver = documentDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async registerDocument(externalUrl: string, contentHash: string): Promise<void> {
        await this._documentDriver.registerDocument(externalUrl, contentHash);
    }

    async getDocumentsCounter(): Promise<number> {
        return this._documentDriver.getDocumentsCounter();
    }

    async getDocumentInfoById(id: number): Promise<DocumentInfo> {
        return this._documentDriver.getDocumentById(id);
    }

    async getCompleteDocument(documentInfo: DocumentInfo): Promise<Document> {
        if (!this._icpFileDriver) throw new Error('DocumentService: ICPFileDriver has not been set');
        try {
            // const { filename, date, lines } = await this._storageMetadataDriver.read(StorageOperationType.TRANSACTION_DOCUMENT, metadataSpec);
            // const fileContent = await this._storageDocumentDriver.read(StorageOperationType.TRANSACTION_DOCUMENT, documentSpec);
            // if (fileContent) return new Document(documentInfo, filename, new Date(date), fileContent, lines);

            const fileContent = await this._icpFileDriver.read(documentInfo.externalUrl);
            // TODO: refactor this
            return new Document(documentInfo, documentInfo.externalUrl.split('/')[8], new Date(), fileContent, []);
        } catch (e: any) {
            throw new Error(`Error while retrieve document file from external storage: ${e.message}`);
        }
    }

    async addAdmin(address: string): Promise<void> {
        await this._documentDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._documentDriver.removeAdmin(address);
    }

    async addTradeManager(address: string): Promise<void> {
        await this._documentDriver.addTradeManager(address);
    }

    async removeTradeManager(address: string): Promise<void> {
        await this._documentDriver.removeTradeManager(address);
    }
}

export default DocumentService;
