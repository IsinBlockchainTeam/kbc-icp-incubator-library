import { DocumentDriver } from '../drivers/DocumentDriver';
import {DocumentInfo, DocumentType} from '../entities/DocumentInfo';
import {Document, TransactionLine} from '../entities/Document';
import {ICPFileDriver} from "../drivers/ICPFileDriver";
import FileHelpers from "../utils/fileHelpers";

export class DocumentService {
    private _documentDriver: DocumentDriver;

    private readonly _icpFileDriver: ICPFileDriver;

    constructor(documentDriver: DocumentDriver, icpFileDriver: ICPFileDriver) {
        this._documentDriver = documentDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async registerDocument(externalUrl: string, contentHash: string): Promise<void> {
        return this._documentDriver.registerDocument(externalUrl, contentHash);
    }

    async updateDocument(documentId: number, externalUrl: string, contentHash: string): Promise<void> {
        return this._documentDriver.updateDocument(documentId, externalUrl, contentHash);
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
            const path = documentInfo.externalUrl.split('/').slice(0, -1).join('/');
            const metadataName = FileHelpers.removeFileExtension(documentInfo.externalUrl.split(path + '/')[1]);

            interface DocumentMetadata {
                fileName: string;
                documentType: DocumentType;
                date: Date;
                transactionLines: TransactionLine[];
            }
            const documentMetadata: DocumentMetadata = FileHelpers.getObjectFromBytes(await this._icpFileDriver.read(path + '/' + metadataName + '-metadata.json')) as DocumentMetadata;
            const fileName = documentMetadata.fileName;
            const documentType = documentMetadata.documentType;
            const date = documentMetadata.date;
            const transactionLines = documentMetadata.transactionLines;
            if(!fileName || !documentType || !date) throw new Error('Error while retrieving document metadata from external storage: missing fields');

            const fileContent = await this._icpFileDriver.read(documentInfo.externalUrl);
            return new Document(documentInfo, fileName, documentType, new Date(date), fileContent, transactionLines);
        } catch (e: any) {
            throw new Error(`Error while retrieving document file from external storage: ${e.message}`);
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
