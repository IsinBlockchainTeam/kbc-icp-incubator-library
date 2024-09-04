import { FileHelpers } from '@blockchain-lib/common';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo } from '../entities/DocumentInfo';
import { Document, DocumentMetadata } from '../entities/Document';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { RoleProof } from '../types/RoleProof';

export class DocumentService {
    private _documentDriver: DocumentDriver;

    private readonly _icpFileDriver: ICPFileDriver;

    constructor(documentDriver: DocumentDriver, icpFileDriver: ICPFileDriver) {
        this._documentDriver = documentDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async registerDocument(
        roleProof: RoleProof,
        externalUrl: string,
        contentHash: string
    ): Promise<number> {
        return this._documentDriver.registerDocument(roleProof, externalUrl, contentHash);
    }

    async updateDocument(
        roleProof: RoleProof,
        documentId: number,
        externalUrl: string,
        contentHash: string,
        uploadedBy: string
    ): Promise<void> {
        return this._documentDriver.updateDocument(
            roleProof,
            documentId,
            externalUrl,
            contentHash,
            uploadedBy
        );
    }

    async getDocumentsCounter(roleProof: RoleProof): Promise<number> {
        return this._documentDriver.getDocumentsCounter(roleProof);
    }

    async getDocumentInfoById(roleProof: RoleProof, id: number): Promise<DocumentInfo> {
        return this._documentDriver.getDocumentById(roleProof, id);
    }

    async getCompleteDocument(documentInfo: DocumentInfo): Promise<Document> {
        try {
            const path = documentInfo.externalUrl.split('/').slice(0, -1).join('/');
            const metadataName = FileHelpers.removeFileExtension(
                documentInfo.externalUrl.split(`${path}/`)[1]
            );

            const documentMetadata: DocumentMetadata = FileHelpers.getObjectFromBytes(
                await this._icpFileDriver.read(`${path}/${metadataName}-metadata.json`)
            ) as DocumentMetadata;
            const fileName = documentMetadata.fileName;
            const documentType = documentMetadata.documentType;
            const date = documentMetadata.date;
            const transactionLines = documentMetadata.transactionLines;
            const quantity = documentMetadata.quantity;
            if (!fileName || !documentType || !date) throw new Error('Missing fields');

            const fileContent = await this._icpFileDriver.read(documentInfo.externalUrl);
            return new Document(
                documentInfo,
                fileName,
                documentType,
                new Date(date),
                fileContent,
                transactionLines,
                quantity
            );
        } catch (e: any) {
            throw new Error(
                `Error while retrieving document file from external storage: ${e.message}`
            );
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
