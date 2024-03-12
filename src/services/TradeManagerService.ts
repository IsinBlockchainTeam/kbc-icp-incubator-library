import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { TradeType } from '../types/TradeType';
import { BasicTrade } from '../entities/BasicTrade';
import { OrderTrade } from '../entities/OrderTrade';
import { Trade } from '../entities/Trade';
import { MetadataStorage, MetadataType, IStorageMetadataDriver } from '../drivers/IStorageMetadataDriver';

export class TradeManagerService {
    private _tradeManagerDriver: TradeManagerDriver;

    private readonly _storageMetadataDriver?: IStorageMetadataDriver;

    constructor(tradeManagerDriver: TradeManagerDriver, storageMetadataDriver?: IStorageMetadataDriver) {
        this._tradeManagerDriver = tradeManagerDriver;
        this._storageMetadataDriver = storageMetadataDriver;
    }

    async registerBasicTrade(supplier: string, customer: string, commissioner: string, name: string, metadataStorage?: MetadataStorage): Promise<BasicTrade> {
        console.log('metadataStorage: ', metadataStorage);
        let externalUrl = '';
        if (metadataStorage) {
            if (!this._storageMetadataDriver) throw new Error('Missing storage metadata driver.');
            externalUrl = await this._storageMetadataDriver.create(
                MetadataType.TRANSACTION,
                { metadata: metadataStorage.metadata, bcResourceId: metadataStorage.bcResourceId },
            );
        }
        return this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, name);
    }

    async registerOrderTrade(supplier: string, customer: string, commissioner: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string, metadataStorage?: MetadataStorage): Promise<OrderTrade> {
        let externalUrl = '';
        if (metadataStorage) {
            if (!this._storageMetadataDriver) throw new Error('Missing storage metadata driver.');
            externalUrl = await this._storageMetadataDriver.create(
                MetadataType.TRANSACTION,
                { metadata: metadataStorage.metadata, bcResourceId: metadataStorage.bcResourceId },
            );
        }
        return this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
    }

    async getTradeCounter(): Promise<number> {
        return this._tradeManagerDriver.getTradeCounter();
    }

    async getTrades(): Promise<Trade[]> {
        return this._tradeManagerDriver.getTrades();
    }

    async getTradeType(id: number): Promise<TradeType> {
        return this._tradeManagerDriver.getTradeType(id);
    }

    async getTradesAndTypes(): Promise<Map<string, TradeType>> {
        return this._tradeManagerDriver.getTradesAndTypes();
    }

    async getTrade(id: number): Promise<string> {
        return this._tradeManagerDriver.getTrade(id);
    }

    async getTradesByMaterial(materialId: number): Promise<Trade[]> {
        return this._tradeManagerDriver.getTradesByMaterial(materialId);
    }

    async getTradeIdsOfSupplier(supplier: string): Promise<number[]> {
        return this._tradeManagerDriver.getTradeIdsOfSupplier(supplier);
    }

    async getTradeIdsOfCommissioner(commissioner: string): Promise<number[]> {
        return this._tradeManagerDriver.getTradeIdsOfCommissioner(commissioner);
    }
}
