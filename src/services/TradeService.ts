import { TradeDriver } from '../drivers/TradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import {ICPMetadataDriver} from "../drivers/ICPMetadataDriver";

export class TradeService {
    protected _tradeDriver: TradeDriver;

    protected _storageMetadataDriver?: ICPMetadataDriver;

    constructor(tradeDriver: TradeDriver, storageMetadataDriver?: ICPMetadataDriver) {
        this._tradeDriver = tradeDriver;
        if(storageMetadataDriver)
            this._storageMetadataDriver = storageMetadataDriver;
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

    // async addDocument(lineId: number, name: string, documentType: DocumentType, documentStorage?: {spec: DS, fileBuffer: Buffer}, metadataStorage?: {spec: MS, value: any}): Promise<void> {
    //     let externalUrl = '';
    //     let contentHash = '';
    //     if (documentStorage) {
    //         if (!this._storageDocumentDriver) throw new Error('Storage document driver is not available');
    //         externalUrl = await this._storageDocumentDriver.create(StorageOperationType.TRANSACTION_DOCUMENT, documentStorage?.fileBuffer, documentStorage?.spec);
    //         contentHash = FileHelpers.computeHashFromBuffer(documentStorage.fileBuffer);
    //     }
    //     if (metadataStorage) {
    //         if (!this._storageMetadataDriver) throw new Error('Storage metadata driver is not available');
    //         await this._storageMetadataDriver.create(StorageOperationType.TRANSACTION_DOCUMENT, metadataStorage.value, [], metadataStorage.spec);
    //     }
    //
    //     return this._tradeDriver.addDocument(lineId, name, documentType, externalUrl, contentHash);
    // }

    // TODO: implement this method
    async addDocument(lineId: number, name: string, documentType: DocumentType, externalUrl: string): Promise<void> {
        const contentHash = "";
        return this._tradeDriver.addDocument(lineId, name, documentType, externalUrl, contentHash);
    }

    async addAdmin(account: string): Promise<void> {
        return this._tradeDriver.addAdmin(account);
    }

    async removeAdmin(account: string): Promise<void> {
        return this._tradeDriver.removeAdmin(account);
    }
}
