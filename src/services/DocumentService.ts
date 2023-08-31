import { DocumentDriver } from '../drivers/DocumentDriver';
import { Document } from '../entities/Document';

export class DocumentService {
    private _documentDriver: DocumentDriver;

    constructor(documentDriver: DocumentDriver) {
        this._documentDriver = documentDriver;
    }

    async registerDocument(ownerAddress: string, transactionId: number, name: string, documentType: string, externalUrl: string): Promise<void> {
        await this._documentDriver.registerDocument(ownerAddress, transactionId, name, documentType, externalUrl);
    }

    async getDocumentCounter(ownerAddress: string): Promise<number> {
        return this._documentDriver.getDocumentCounter(ownerAddress);
    }

    async documentExists(ownerAddress: string, transactionId: number, documentId: number): Promise<boolean> {
        return this._documentDriver.documentExists(ownerAddress, transactionId, documentId);
    }

    async getDocumentInfo(ownerAddress: string, transactionId: number, documentId: number): Promise<Document> {
        return this._documentDriver.getDocumentInfo(ownerAddress, transactionId, documentId);
    }

    async getTransactionDocumentIds(ownerAddress: string, transactionId: number): Promise<number[]> {
        return this._documentDriver.getTransactionDocumentIds(ownerAddress, transactionId);
    }

    async getDocumentsByTransaction(ownerAddress: string, transactionId: number): Promise<Document[]> {
        const documentIds = await this.getTransactionDocumentIds(ownerAddress, transactionId);
        return Promise.all(documentIds.map(async (id) => this.getDocumentInfo(ownerAddress, transactionId, id)));
    }

    async addAdmin(address: string): Promise<void> {
        await this._documentDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._documentDriver.removeAdmin(address);
    }

    async addOrderManager(address: string): Promise<void> {
        await this._documentDriver.addOrderManager(address);
    }

    async removeOrderManager(address: string): Promise<void> {
        await this._documentDriver.removeOrderManager(address);
    }
}

export default DocumentService;
