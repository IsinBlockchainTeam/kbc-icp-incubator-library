import {
    StorageACR,
} from '@blockchain-lib/common';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { IStorageMetadataDriver, MetadataSpec } from '../drivers/IStorageMetadataDriver';
import { DocumentSpec, IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';
import { StorageOperationType } from '../types/StorageOperationType';
import { computeHashFromBuffer } from '../utils/utils';
import { DocumentDriver } from '../drivers/DocumentDriver';

export class TradeService<MS extends MetadataSpec, DS extends DocumentSpec, ACR extends StorageACR> {
    protected _tradeDriver: TradeDriver;

    private readonly _documentDriver?: DocumentDriver;

    protected readonly _storageMetadataDriver?: IStorageMetadataDriver<MS, ACR>;

    protected readonly _storageDocumentDriver?: IStorageDocumentDriver<DS>;

    constructor(args: {tradeDriver: TradeDriver, documentDriver?: DocumentDriver, storageMetadataDriver?: IStorageMetadataDriver<MS, ACR>, storageDocumentDriver?: IStorageDocumentDriver<DS>}) {
        this._tradeDriver = args.tradeDriver;
        this._documentDriver = args.documentDriver;
        this._storageMetadataDriver = args.storageMetadataDriver;
        this._storageDocumentDriver = args.storageDocumentDriver;
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

    async getTradeStatus(): Promise<TradeStatus> {
        return this._tradeDriver.getTradeStatus();
    }

    async addDocument(documentType: DocumentType, documentStorage?: {spec: DS, fileBuffer: Uint8Array}, metadataStorage?: {spec: MS, value: any}): Promise<void> {
        let externalUrl = '';
        let contentHash = '';
        if (documentStorage) {
            // TODO: remove this comment
            // if (!this._storageDocumentDriver) throw new Error('Storage document driver is not available');
            // externalUrl = await this._storageDocumentDriver.create(StorageOperationType.TRANSACTION_DOCUMENT, documentStorage?.fileBuffer, documentStorage?.spec);
            // contentHash = computeHashFromBuffer(documentStorage.fileBuffer);
        }
        if (metadataStorage) {
            // TODO: remove this comment
            // if (!this._storageMetadataDriver) throw new Error('Storage metadata driver is not available');
            // await this._storageMetadataDriver.create(StorageOperationType.TRANSACTION_DOCUMENT, metadataStorage.value, [], metadataStorage.spec);
        }

        return this._tradeDriver.addDocument(documentType, externalUrl, contentHash);
    }

    async getAllDocumentIds(): Promise<number[]> {
        return this._tradeDriver.getAllDocumentIds();
    }

    async getAllDocuments(): Promise<DocumentInfo[]> {
        if (!this._documentDriver) throw new Error('Cannot perform this operation without a document driver');
        const ids = await this.getAllDocumentIds();
        return Promise.all(ids.map((id) => this._documentDriver!.getDocumentById(id)));
    }

    async getDocumentIdsByType(documentType: DocumentType): Promise<number[]> {
        return this._tradeDriver.getDocumentIdsByType(documentType);
    }

    async getDocumentsByType(documentType: DocumentType): Promise<DocumentInfo[]> {
        if (!this._documentDriver) throw new Error('Cannot perform this operation without a document driver');
        const ids = await this.getDocumentIdsByType(documentType);
        return Promise.all(ids.map((id) => this._documentDriver!.getDocumentById(id)));
    }

    async addAdmin(account: string): Promise<void> {
        return this._tradeDriver.addAdmin(account);
    }

    async removeAdmin(account: string): Promise<void> {
        return this._tradeDriver.removeAdmin(account);
    }
}
