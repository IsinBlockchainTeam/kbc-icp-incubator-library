import {TradeManagerDriver} from '../drivers/TradeManagerDriver';
import {TradeType} from '../types/TradeType';
import {BasicTrade} from '../entities/BasicTrade';
import {OrderTrade, OrderTradeMetadata} from '../entities/OrderTrade';
import {Trade} from '../entities/Trade';
import {ICPMetadataDriver} from "../drivers/ICPMetadataDriver";
import {ICPResourceSpec} from "@blockchain-lib/common";

export class TradeManagerService {
    private _tradeManagerDriver: TradeManagerDriver;

    private readonly _storageMetadataDriver?: ICPMetadataDriver;

    constructor(tradeManagerDriver: TradeManagerDriver, storageMetadataDriver?: ICPMetadataDriver) {
        this._tradeManagerDriver = tradeManagerDriver;
        if (storageMetadataDriver)
            this._storageMetadataDriver = storageMetadataDriver;
    }

    // TODO: store external url
    async registerBasicTrade(supplier: string, customer: string, commissioner: string,  name: string): Promise<BasicTrade> {
        return this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, 'externalUrl', name);
    }

    // async registerBasicTrade(supplier: string, customer: string, commissioner: string, name: string, metadataStorage?: {spec?: MS, aclRules?: ACR[], value: any}): Promise<BasicTrade> {
    //     let externalUrl = '';
    //     if (metadataStorage) {
    //         if (!this._storageMetadataDriver) throw new Error('Missing storage metadata driver.');
    //         externalUrl = await this._storageMetadataDriver.create(
    //             StorageOperationType.TRANSACTION,
    //             metadataStorage.value,
    //             metadataStorage.aclRules,
    //             metadataStorage.spec,
    //         );
    //     }
    //     return this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, name);
    // }

    // async registerOrderTrade(supplier: string, customer: string, commissioner: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string, metadataStorage?: {spec?: MS, aclRules?: ACR[], value: any}): Promise<OrderTradeInfo> {
    //     let externalUrl = '';
    //     if (metadataStorage) {
    //         if (!this._storageMetadataDriver) throw new Error('Missing storage metadata driver.');
    //         externalUrl = await this._storageMetadataDriver.create(
    //             StorageOperationType.TRANSACTION,
    //             metadataStorage.value,
    //             metadataStorage.aclRules,
    //             metadataStorage.spec,
    //         );
    //     }
    //     return this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
    // }

    // TODO: store external url
    async registerOrderTrade(supplier: string, customer: string, commissioner: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string, metadata: OrderTradeMetadata): Promise<OrderTrade> {
        if(!this._storageMetadataDriver)
            throw new Error("TradeManagerService: Storage metadata driver has not been set");

        // TODO: remove hardcoded data
        const resourceSpec: ICPResourceSpec = {
            name: "metadata.json",
            type: "application/json",
            organizationId: 0
        }
        await this._storageMetadataDriver.create(metadata, resourceSpec);
        return this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, 'externalUrl', paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
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
