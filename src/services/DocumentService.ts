import { IPFSService } from '@blockchain-lib/common';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { Document } from '../entities/Document';

export class DocumentService {
    private _documentDriver: DocumentDriver;

    private readonly _ipfsService?: IPFSService;

    constructor(documentDriver: DocumentDriver, ipfsService?: IPFSService) {
        this._documentDriver = documentDriver;
        this._ipfsService = ipfsService;
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

    async getCompleteDocument(documentInfo: DocumentInfo): Promise<Document | undefined> {
        if (!this._ipfsService) throw new Error('IPFS Service not available');
        try {
            const { filename, date, fileUrl, transactionLines } = await this._ipfsService!.retrieveJSON(documentInfo.externalUrl);
            const fileContent = await this._ipfsService!.retrieveFile(fileUrl);
            if (fileContent) return new Document(documentInfo, filename, new Date(date), fileContent, transactionLines);
        } catch (e: any) {
            throw new Error(`Error while retrieve document file from IPFS: ${e.message}`);
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
