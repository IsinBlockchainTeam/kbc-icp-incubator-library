import {TradeManagerDriver} from '../drivers/TradeManagerDriver';
import {TradeType} from '../types/TradeType';
import {BasicTrade} from '../entities/BasicTrade';
import {OrderTrade, OrderTradeMetadata} from '../entities/OrderTrade';
import {Trade} from '../entities/Trade';
import {ICPFileDriver} from "../drivers/ICPFileDriver";
import {ICPResourceSpec} from "@blockchain-lib/common";
import {URLStructure} from "../types/URLStructure";
import {DocumentDriver} from "../drivers/DocumentDriver";
import {TradeDriver} from "../drivers/TradeDriver";
import FileHelpers from "../utils/fileHelpers";

export interface TradeManagerServiceArgs {
    tradeManagerDriver: TradeManagerDriver,
    tradeDriver?: TradeDriver,
    documentDriver?: DocumentDriver,
    icpFileDriver?: ICPFileDriver
}

export class TradeManagerService {
    private _tradeManagerDriver: TradeManagerDriver;

    private _tradeDriver?: TradeDriver;

    private _documentDriver?: DocumentDriver;

    private readonly _icpFileDriver?: ICPFileDriver;

    constructor(args: TradeManagerServiceArgs) {
        this._tradeManagerDriver = args.tradeManagerDriver;
        if (args.tradeDriver)
            this._tradeDriver = args.tradeDriver;
        if (args.documentDriver)
            this._documentDriver = args.documentDriver;
        if (args.icpFileDriver)
            this._icpFileDriver = args.icpFileDriver;
    }

    // TODO: store external url
    async registerBasicTrade(supplier: string, customer: string, commissioner: string,  name: string): Promise<BasicTrade> {
        return this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, 'externalUrl', name);
    }

    // async registerBasicTrade(supplier: string, customer: string, commissioner: string, name: string, metadataStorage?: {spec?: MS, aclRules?: ACR[], value: any}): Promise<BasicTrade> {
    //     let externalUrl = '';
    //     if (metadataStorage) {
    //         if (!this._icpFileDriver) throw new Error('Missing storage metadata driver.');
    //         externalUrl = await this._icpFileDriver.create(
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
    //         if (!this._icpFileDriver) throw new Error('Missing storage metadata driver.');
    //         externalUrl = await this._icpFileDriver.create(
    //             StorageOperationType.TRANSACTION,
    //             metadataStorage.value,
    //             metadataStorage.aclRules,
    //             metadataStorage.spec,
    //         );
    //     }
    //     return this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
    // }

    async registerOrderTrade(supplier: string, customer: string, commissioner: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string, metadata: OrderTradeMetadata, urlStructure: URLStructure): Promise<OrderTrade> {
        if(!this._icpFileDriver)
            throw new Error("TradeManagerService: Storage metadata driver has not been set");
        if(!this._documentDriver)
            throw new Error("TradeManagerService: Document driver has not been set");
        if(!this._tradeDriver)
            throw new Error("TradeManagerService: Trade driver has not been set");

        let externalUrl = urlStructure.prefix.endsWith('/') ? urlStructure.prefix : urlStructure.prefix + '/';
        externalUrl += "organizations/" + urlStructure.organizationId + "/transactions/";

        const trade: OrderTrade = await this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

        const name = trade.externalUrl + "/files/metadata.json";
        const resourceSpec: ICPResourceSpec = {
            name,
            type: 'application/json'
        };
        const bytes = FileHelpers.getBytesFromObject(metadata);
        await this._icpFileDriver.create(bytes, resourceSpec);

        const fileHash = FileHelpers.getHash(bytes);
        await this._documentDriver.registerDocument(name, fileHash.toString());



        return trade;
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
