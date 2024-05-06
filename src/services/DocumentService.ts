import { StorageACR } from '@blockchain-lib/common';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Document } from '../entities/Document';
import { DocumentSpec, ISolidStorageDocumentDriver } from '../drivers/ISolidStorageDocumentDriver';
import { ISolidStorageMetadataDriver, MetadataSpec } from '../drivers/ISolidStorageMetadataDriver';
import { StorageOperationType } from '../types/StorageOperationType';

export class DocumentService<MS extends MetadataSpec, DS extends DocumentSpec, ACR extends StorageACR> {
    private _documentDriver: DocumentDriver;

    private readonly _storageDocumentDriver?: ISolidStorageDocumentDriver<DS>;

    private readonly _storageMetadataDriver?: ISolidStorageMetadataDriver<MS, ACR>;

    constructor(args: {documentDriver: DocumentDriver, storageMetadataDriver?: ISolidStorageMetadataDriver<MS, ACR>, storageDocumentDriver?: ISolidStorageDocumentDriver<DS>}) {
        this._documentDriver = args.documentDriver;
        this._storageMetadataDriver = args.storageMetadataDriver;
        this._storageDocumentDriver = args.storageDocumentDriver;
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

    async getCompleteDocument(documentInfo: DocumentInfo, metadataSpec: MS, documentSpec: DS): Promise<Document | undefined> {
        if (!this._storageDocumentDriver) throw new Error('Storage document driver is not available');
        if (!this._storageMetadataDriver) throw new Error('Storage metadata driver is not available');
        try {
            const { filename, date, lines } = await this._storageMetadataDriver.read(StorageOperationType.TRANSACTION_DOCUMENT, metadataSpec);
            const fileContent = await this._storageDocumentDriver.read(StorageOperationType.TRANSACTION_DOCUMENT, documentSpec);
            if (fileContent) return new Document(documentInfo, filename, new Date(date), fileContent, lines);
        } catch (e: any) {
            throw new Error(`Error while retrieve document file from external storage: ${e.message}`);
        }
        return undefined;
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
