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

    async registerDocument(ownerAddress: string, transactionId: number, name: string, documentType: string, externalUrl: string): Promise<void> {
        await this._documentDriver.registerDocument(ownerAddress, transactionId, name, documentType, externalUrl);
    }

    async getDocumentCounter(ownerAddress: string): Promise<number> {
        return this._documentDriver.getDocumentCounter(ownerAddress);
    }

    async documentExists(ownerAddress: string, transactionId: number, documentId: number): Promise<boolean> {
        return this._documentDriver.documentExists(ownerAddress, transactionId, documentId);
    }

    async getDocumentInfo(ownerAddress: string, transactionId: number, documentId: number): Promise<DocumentInfo> {
        return this._documentDriver.getDocumentInfo(ownerAddress, transactionId, documentId);
    }

    async getCompleteDocument(documentInfo: DocumentInfo): Promise<Document | undefined> {
        if (!this._ipfsService) throw new Error('IPFS Service not available');
        try {
            const { filename, fileUrl } = await this._ipfsService!.retrieveJSON(documentInfo.externalUrl);
            const fileContent = await this._ipfsService!.retrieveFile(fileUrl);
            if (fileContent) return new Document(documentInfo, filename, fileContent);
        } catch (e) {
            console.error('Error while retrieve document file from IPFS: ', e);
        }
        return undefined;
    }

    async getTransactionDocumentIds(ownerAddress: string, transactionId: number): Promise<number[]> {
        return this._documentDriver.getTransactionDocumentIds(ownerAddress, transactionId);
    }

    async getDocumentsInfoByTransaction(ownerAddress: string, transactionId: number): Promise<DocumentInfo[]> {
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
