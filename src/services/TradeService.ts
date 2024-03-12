import { TradeDriver } from '../drivers/TradeDriver';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { IStorageMetadataDriver, MetadataStorage, MetadataType } from '../drivers/IStorageMetadataDriver';
import { DocumentStorage, IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';

export class TradeService {
    protected _tradeDriver: TradeDriver;

    private readonly _storageMetadataDriver?: IStorageMetadataDriver;

    private readonly _storageDocumentDriver?: IStorageDocumentDriver;

    constructor(args: {tradeDriver: TradeDriver, storageMetadataDriver?: IStorageMetadataDriver, storageDocumentDriver?: IStorageDocumentDriver}) {
        this._tradeDriver = args.tradeDriver;
        this._storageMetadataDriver = args.storageMetadataDriver;
        this._storageDocumentDriver = args.storageDocumentDriver;
    }
    // constructor(supplyChainDriver: TradeDriver, storageMetadataDriver: IStorageMetadataDriver, storageDocumentDriver: IStorageDocumentDriver) {
    //     this._tradeDriver = supplyChainDriver;
    //     this._storageMetadataDriver = storageMetadataDriver;
    //     this._storageDocumentDriver = storageDocumentDriver;
    // }

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

    async addDocument(lineId: number, name: string, documentType: DocumentType, documentStorage?: DocumentStorage, metadataStorage?: MetadataStorage): Promise<void> {
        let externalUrl = '';
        if (documentStorage) {
            if (!this._storageDocumentDriver) throw new Error('Storage document driver is not available');
            externalUrl = await this._storageDocumentDriver.create(MetadataType.TRANSACTION_DOCUMENT, documentStorage);
        }
        if (metadataStorage) {
            if (!this._storageMetadataDriver) throw new Error('Storage metadata driver is not available');
            await this._storageMetadataDriver.create(MetadataType.TRANSACTION_DOCUMENT, metadataStorage);
        }
        console.log('externalUrl: ', externalUrl);

        return this._tradeDriver.addDocument(lineId, name, documentType, externalUrl);
    }

    async addAdmin(account: string): Promise<void> {
        return this._tradeDriver.addAdmin(account);
    }

    async removeAdmin(account: string): Promise<void> {
        return this._tradeDriver.removeAdmin(account);
    }
}
