import { ICPResourceSpec } from '@blockchain-lib/common';
import { TradeDriver } from '../drivers/TradeDriver';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { DocumentDriver } from '../drivers/DocumentDriver';
import FileHelpers from '../utils/fileHelpers';
import { DocumentStatus, TransactionLine } from '../entities/Document';

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

    async getLineCounter(): Promise<number> {
        return this._tradeDriver.getLineCounter();
    }

    async getTradeType(): Promise<TradeType> {
        return this._tradeDriver.getTradeType();
    }

    async getLineExists(id: number): Promise<boolean> {
        return this._tradeDriver.getLineExists(id);
    }

    async addDocument(
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
        const fileName = FileHelpers.removeFileExtension(resourceSpec.name);

        resourceSpec.name = `${externalUrl}/files/${resourceSpec.name}`;

        const contentHash = FileHelpers.getHash(fileContent);
        await this._icpFileDriver.create(fileContent, resourceSpec, delegatedOrganizationIds);
        const documentMetadata = {
            fileName: resourceSpec.name,
            documentType,
            date: new Date(),
            transactionLines,
            quantity
        };

        await this._icpFileDriver.create(
            FileHelpers.getBytesFromObject(documentMetadata),
            {
                name: `${externalUrl}/files/${fileName}-metadata.json`,
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        return this._tradeDriver.addDocument(
            documentType,
            resourceSpec.name,
            contentHash.toString()
        );
    }

    async validateDocument(documentId: number, status: DocumentStatus): Promise<void> {
        if (status === DocumentStatus.NOT_EVALUATED)
            throw new Error('Cannot validate document with status NOT_EVALUATED');
        return this._tradeDriver.validateDocument(documentId, status);
    }

    async getAllDocumentIds(): Promise<number[]> {
        return this._tradeDriver.getAllDocumentIds();
    }

    async getAllDocuments(): Promise<DocumentInfo[]> {
        if (!this._documentDriver)
            throw new Error('Cannot perform this operation without a document driver');
        const ids = await this.getAllDocumentIds();
        return Promise.all(ids.map((id) => this._documentDriver!.getDocumentById(id)));
    }

    async getDocumentIdsByType(documentType: DocumentType): Promise<number[]> {
        return this._tradeDriver.getDocumentIdsByType(documentType);
    }

    async getDocumentsByType(documentType: DocumentType): Promise<DocumentInfo[]> {
        if (!this._documentDriver)
            throw new Error('Cannot perform this operation without a document driver');
        const ids = await this.getDocumentIdsByType(documentType);
        return Promise.all(ids.map((id) => this._documentDriver!.getDocumentById(id)));
    }

    async getDocumentStatus(documentId: number): Promise<DocumentStatus> {
        return this._tradeDriver.getDocumentStatus(documentId);
    }

    async addAdmin(account: string): Promise<void> {
        return this._tradeDriver.addAdmin(account);
    }

    async removeAdmin(account: string): Promise<void> {
        return this._tradeDriver.removeAdmin(account);
    }
}
