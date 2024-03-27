import { StorageACR } from '@blockchain-lib/common';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { Document } from '../entities/Document';
import { DocumentSpec, IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';
import { IStorageMetadataDriver, MetadataSpec } from '../drivers/IStorageMetadataDriver';
import { StorageOperationType } from '../types/StorageOperationType';

export class DocumentService<MS extends MetadataSpec, DS extends DocumentSpec, ACR extends StorageACR> {
    private _documentDriver: DocumentDriver;

    private readonly _storageDocumentDriver?: IStorageDocumentDriver<DS>;

    private readonly _storageMetadataDriver?: IStorageMetadataDriver<MS, ACR>;

    constructor(args: {documentDriver: DocumentDriver, storageMetadataDriver?: IStorageMetadataDriver<MS, ACR>, storageDocumentDriver?: IStorageDocumentDriver<DS>}) {
        this._documentDriver = args.documentDriver;
        this._storageMetadataDriver = args.storageMetadataDriver;
        this._storageDocumentDriver = args.storageDocumentDriver;
    }

    async registerDocument(transactionId: number, transactionType: string, name: string, documentType: DocumentType, externalUrl: string): Promise<void> {
        await this._documentDriver.registerDocument(transactionId, transactionType, name, documentType, externalUrl);
    }

    async getDocumentsCounterByTransactionIdAndType(transactionId: number, transactionType: string): Promise<number> {
        return this._documentDriver.getDocumentsCounterByTransactionIdAndType(transactionId, transactionType);
    }

    async getDocumentsInfoByDocumentType(transactionId: number, transactionType: string, documentType: DocumentType): Promise<DocumentInfo[]> {
        return this._documentDriver.getDocumentsInfoByDocumentType(transactionId, transactionType, documentType);
    }

    async getCompleteDocument(documentInfo: DocumentInfo, metadataSpec: MS, documentSpec: DS): Promise<Document | undefined> {
        if (!this._storageDocumentDriver) throw new Error('Storage document driver is not available');
        if (!this._storageMetadataDriver) throw new Error('Storage metadata driver is not available');
        try {
            const { filename, date, lines } = await this._storageMetadataDriver.read(StorageOperationType.TRANSACTION_DOCUMENT, metadataSpec);
            const fileContent = await this._storageDocumentDriver.read(StorageOperationType.TRANSACTION_DOCUMENT, documentSpec);
            if (fileContent) return new Document(documentInfo, filename, new Date(date), new Blob([fileContent]), lines);
        } catch (e: any) {
            throw new Error(`Error while retrieve document file from external storage: ${e.message}`);
        }
        return undefined;
    }

    async getDocumentsInfoByTransactionIdAndType(transactionId: number, transactionType: string): Promise<DocumentInfo[]> {
        const docTypesCounter = Object.keys(DocumentType).length / 2;
        const results = await Promise.all(Array.from({ length: docTypesCounter }, (_, index) => index)
            .map(async (docTypeIndex) => this.getDocumentsInfoByDocumentType(transactionId, transactionType, docTypeIndex)));
        return results.reduce((acc, currentResult) => acc.concat(currentResult), []);
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
