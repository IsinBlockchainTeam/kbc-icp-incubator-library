import { IPFSService } from '@blockchain-lib/common';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Document } from '../entities/Document';

export class DocumentService {
    private _documentDriver: DocumentDriver;

    private readonly _ipfsService?: IPFSService;

    constructor(documentDriver: DocumentDriver, ipfsService?: IPFSService) {
        this._documentDriver = documentDriver;
        this._ipfsService = ipfsService;
    }

    async registerDocument(transactionId: number, name: string, documentType: string, externalUrl: string): Promise<void> {
        await this._documentDriver.registerDocument(transactionId, name, documentType, externalUrl);
    }

    async getDocumentsCounterByTransactionIdAndType(transactionId: number): Promise<number> {
        return this._documentDriver.getDocumentsCounterByTransactionIdAndType(transactionId);
    }

    async documentExists(transactionId: number, documentId: number): Promise<boolean> {
        return this._documentDriver.documentExists(transactionId, documentId);
    }

    async getDocumentInfo(transactionId: number, documentId: number): Promise<DocumentInfo> {
        return this._documentDriver.getDocumentInfo(transactionId, documentId);
    }

    async getCompleteDocument(documentInfo: DocumentInfo): Promise<Document | undefined> {
        if (!this._ipfsService) throw new Error('IPFS Service not available');
        try {
            const { filename, fileUrl } = await this._ipfsService!.retrieveJSON(documentInfo.externalUrl);
            const fileContent = await this._ipfsService!.retrieveFile(fileUrl);
            if (fileContent) return new Document(documentInfo, filename, fileContent);
        } catch (e: any) {
            throw new Error(`Error while retrieve document file from IPFS: ${e.message}`);
        }
        return undefined;
    }

    async getDocumentsInfoByTransaction(transactionId: number): Promise<DocumentInfo[]> {
        const counter = await this.getDocumentsCounterByTransactionIdAndType(transactionId);
        return Promise.all(Array.from({ length: counter }, (_, index) => index + 1).map(async (id) => this.getDocumentInfo(transactionId, id)));
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
