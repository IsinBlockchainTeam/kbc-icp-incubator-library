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

    // TODO: store external url
    async registerBasicTrade(supplier: string, customer: string, commissioner: string, name: string): Promise<[number, string, string]> {
        const externalUrl = '';
        return this._tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, name);
    }

    async registerOrderTrade(supplier: string, customer: string, commissioner: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string, metadata: OrderTradeMetadata, urlStructure: URLStructure): Promise<[number, string, string]> {
        if(!this._icpFileDriver)
            throw new Error("TradeManagerService: Storage metadata driver has not been set");

        let externalUrl = urlStructure.prefix.endsWith('/') ? urlStructure.prefix : urlStructure.prefix + '/';
        externalUrl += "organizations/" + urlStructure.organizationId + "/transactions/";

        const [newTradeId, newTradeAddress, transactionHash] = await this._tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

        // TODO: retrieve new external url
        const newExternalUrl = '';
        const name = newExternalUrl + "/files/metadata.json";
        const resourceSpec: ICPResourceSpec = {
            name,
            type: 'application/json'
        };
        const bytes = FileHelpers.getBytesFromObject(metadata);
        await this._icpFileDriver.create(bytes, resourceSpec);

        // TODO: store metadata hash on-chain and associate it with the trade
        // const tradeDriver = ... find a way to get the trade driver, given that the Signer is not accessible here ...
        // const fileHash = FileHelpers.getHash(bytes);
        // await tradeDriver.addDocument(DocumentType.METADATA, name, fileHash.toString());

        return [newTradeId, newTradeAddress, transactionHash];
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
