import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { TradeDriver } from '../drivers/TradeDriver';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentMetadata, DocumentStatus, TransactionLine } from '../entities/Document';
import { RoleProof } from '../types/RoleProof';

export class TradeService {
    protected _tradeDriver: TradeDriver;

    private readonly _documentDriver?: DocumentDriver;

    protected _icpFileDriver?: ICPFileDriver;

    constructor(
        tradeDriver: TradeDriver,
        documentDriver?: DocumentDriver,
        storageMetadataDriver?: ICPFileDriver
    ) {
        this._tradeDriver = tradeDriver;
        if (documentDriver) this._documentDriver = documentDriver;
        if (storageMetadataDriver) this._icpFileDriver = storageMetadataDriver;
    }

    async getLineCounter(roleProof: RoleProof): Promise<number> {
        return this._tradeDriver.getLineCounter(roleProof);
    }

    async getTradeType(roleProof: RoleProof): Promise<TradeType> {
        return this._tradeDriver.getTradeType(roleProof);
    }

    async getLineExists(roleProof: RoleProof, id: number): Promise<boolean> {
        return this._tradeDriver.getLineExists(roleProof, id);
    }

    async addDocument(
        roleProof: RoleProof,
        documentType: DocumentType,
        fileContent: Uint8Array,
        externalUrl: string,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = [],
        transactionLines: TransactionLine[] = [],
        quantity: number | undefined = undefined
    ): Promise<void> {
        if (!this._icpFileDriver)
            throw new Error('OrderTradeService: ICPFileDriver has not been set');
        const filename = FileHelpers.removeFileExtension(resourceSpec.name);

        resourceSpec.name = `${externalUrl}/files/${resourceSpec.name}`;

        const contentHash = FileHelpers.getHash(fileContent);
        await this._icpFileDriver.create(fileContent, resourceSpec, delegatedOrganizationIds);
        const documentMetadata: DocumentMetadata = {
            filename: resourceSpec.name,
            documentType,
            date: new Date(),
            transactionLines,
            quantity
        };

        await this._icpFileDriver.create(
            FileHelpers.getBytesFromObject(documentMetadata),
            {
                name: `${externalUrl}/files/${filename}-metadata.json`,
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        return this._tradeDriver.addDocument(
            roleProof,
            documentType,
            resourceSpec.name,
            contentHash.toString()
        );
    }

    async validateDocument(
        roleProof: RoleProof,
        documentId: number,
        status: DocumentStatus
    ): Promise<void> {
        if (status === DocumentStatus.NOT_EVALUATED)
            throw new Error('Cannot validate document with status NOT_EVALUATED');
        return this._tradeDriver.validateDocument(roleProof, documentId, status);
    }

    async getAllDocumentIds(roleProof: RoleProof): Promise<number[]> {
        return this._tradeDriver.getAllDocumentIds(roleProof);
    }

    async getAllDocuments(roleProof: RoleProof): Promise<DocumentInfo[]> {
        if (!this._documentDriver)
            throw new Error('Cannot perform this operation without a document driver');
        const ids = await this.getAllDocumentIds(roleProof);
        return Promise.all(ids.map((id) => this._documentDriver!.getDocumentById(roleProof, id)));
    }

    async getDocumentIdsByType(
        roleProof: RoleProof,
        documentType: DocumentType
    ): Promise<number[]> {
        return this._tradeDriver.getDocumentIdsByType(roleProof, documentType);
    }

    async getDocumentsByType(
        roleProof: RoleProof,
        documentType: DocumentType
    ): Promise<DocumentInfo[]> {
        if (!this._documentDriver)
            throw new Error('Cannot perform this operation without a document driver');
        const ids = await this.getDocumentIdsByType(roleProof, documentType);
        return Promise.all(ids.map((id) => this._documentDriver!.getDocumentById(roleProof, id)));
    }

    async getDocumentStatus(roleProof: RoleProof, documentId: number): Promise<DocumentStatus> {
        return this._tradeDriver.getDocumentStatus(roleProof, documentId);
    }
}
