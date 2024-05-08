import {TradeManagerDriver} from '../drivers/TradeManagerDriver';
import {TradeType} from '../types/TradeType';
import {OrderTradeMetadata} from '../entities/OrderTrade';
import {Trade} from '../entities/Trade';
import {ICPFileDriver} from "../drivers/ICPFileDriver";
import {ICPResourceSpec} from "@blockchain-lib/common";
import {URLStructure} from "../types/URLStructure";
import FileHelpers from "../utils/fileHelpers";

export interface TradeManagerServiceArgs {
    tradeManagerDriver: TradeManagerDriver,
    icpFileDriver?: ICPFileDriver
}

export class TradeManagerService {
    private _tradeManagerDriver: TradeManagerDriver;

    private readonly _icpFileDriver?: ICPFileDriver;

    constructor(args: TradeManagerServiceArgs) {
        this._tradeManagerDriver = args.tradeManagerDriver;
        if (args.icpFileDriver)
            this._icpFileDriver = args.icpFileDriver;
    }

    async registerBasicTrade(supplier: string, customer: string, commissioner: string, name: string, metadata: object, urlStructure: URLStructure): Promise<[number, string, string]> {
        // if(!this._icpFileDriver)
        //     throw new Error("TradeManagerService: Storage metadata driver has not been set");
        //
        // let externalUrl = this.buildExternalUrl(urlStructure);
        // const bytes = FileHelpers.getBytesFromObject(metadata);
        // const fileHash = FileHelpers.getHash(bytes);
        //
        // const [newTradeId, newTradeAddress, transactionHash] =
        //     await this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, fileHash.toString(), name);
        //
        // await this.storeMetadataOnICP(newTradeId, bytes, externalUrl);
        //
        // return [newTradeId, newTradeAddress, transactionHash];

        return this.createTrade((externalUrl: string, fileHash: string) => {
            return this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, fileHash, name);
        }, metadata, urlStructure);
    }

    async registerOrderTrade(supplier: string, customer: string, commissioner: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string, metadata: OrderTradeMetadata, urlStructure: URLStructure): Promise<[number, string, string]> {
        // if(!this._icpFileDriver)
        //     throw new Error("TradeManagerService: Storage metadata driver has not been set");
        //
        // let externalUrl = this.buildExternalUrl(urlStructure);
        // const bytes = FileHelpers.getBytesFromObject(metadata);
        // const fileHash = FileHelpers.getHash(bytes);
        //
        // const [newTradeId, newTradeAddress, transactionHash] =
        //     await this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, fileHash.toString(),
        //         paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
        //
        // await this.storeMetadataOnICP(newTradeId, bytes, externalUrl);
        //
        // return [newTradeId, newTradeAddress, transactionHash];

        return this.createTrade((externalUrl: string, fileHash: string) => {
            return this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, fileHash,
                paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
        }, metadata, urlStructure);
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

    private buildExternalUrl(urlStructure: URLStructure): string {
        return urlStructure.prefix.endsWith('/') ? urlStructure.prefix : urlStructure.prefix + '/' +
            "organizations/" + urlStructure.organizationId + "/transactions/";
    }

    private storeMetadataOnICP(newTradeId: number, bytes: Uint8Array, externalUrl: string): Promise<number> {
        if(!this._icpFileDriver)
            throw new Error("TradeManagerService: Storage metadata driver has not been set");

        const newExternalUrl = externalUrl + newTradeId;
        const name = newExternalUrl + "/files/metadata.json";
        const resourceSpec: ICPResourceSpec = {
            name,
            type: 'application/json'
        };
        return this._icpFileDriver.create(bytes, resourceSpec);
    }

    private async createTrade(registerTrade: (externalUrl: string, fileHash: string) => Promise<[number, string, string]>, metadata: object, urlStructure: URLStructure): Promise<[number, string, string]> {
        if(!this._icpFileDriver)
            throw new Error("TradeManagerService: Storage metadata driver has not been set");

        const externalUrl = (urlStructure.prefix.endsWith('/') ? urlStructure.prefix : urlStructure.prefix + '/') +
            "organizations/" + urlStructure.organizationId + "/transactions/";
        const bytes = FileHelpers.getBytesFromObject(metadata);
        const fileHash = FileHelpers.getHash(bytes);

        const [newTradeId, newTradeAddress, transactionHash] = await registerTrade(externalUrl, fileHash.toString());

        const newExternalUrl = externalUrl + newTradeId;
        const name = newExternalUrl + "/files/metadata.json";
        const resourceSpec: ICPResourceSpec = {
            name,
            type: 'application/json'
        };
        await this._icpFileDriver.create(bytes, resourceSpec);

        return [newTradeId, newTradeAddress, transactionHash];
    }
}
