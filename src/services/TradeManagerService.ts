import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { TradeType } from '../types/TradeType';
import { OrderTradeMetadata } from '../entities/OrderTrade';
import { Trade } from '../entities/Trade';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { URLStructure } from '../types/URLStructure';
import { URL_SEGMENTS } from '../constants/ICP';
import { BasicTradeMetadata } from '../entities/BasicTrade';

export interface TradeManagerServiceArgs {
    tradeManagerDriver: TradeManagerDriver;
    icpFileDriver?: ICPFileDriver;
}

type RegisterTradeCallback = (
    externalUrl: string,
    fileHash: string
) => Promise<[number, string, string]>;

export class TradeManagerService {
    private _tradeManagerDriver: TradeManagerDriver;

    private readonly _icpFileDriver?: ICPFileDriver;

    constructor(args: TradeManagerServiceArgs) {
        this._tradeManagerDriver = args.tradeManagerDriver;
        if (args.icpFileDriver) this._icpFileDriver = args.icpFileDriver;
    }

    async registerBasicTrade(
        supplier: string,
        customer: string,
        commissioner: string,
        name: string,
        metadata: BasicTradeMetadata,
        urlStructure: URLStructure,
        delegatedOrganizationIds: number[] = []
    ): Promise<[number, string, string]> {
        return this.registerTrade(
            (externalUrl: string, fileHash: string) =>
                this._tradeManagerDriver.registerBasicTrade(
                    supplier,
                    customer,
                    commissioner,
                    externalUrl,
                    fileHash,
                    name
                ),
            metadata,
            urlStructure,
            delegatedOrganizationIds
        );
    }

    async registerOrderTrade(
        supplier: string,
        customer: string,
        commissioner: string,
        paymentDeadline: number,
        documentDeliveryDeadline: number,
        arbiter: string,
        shippingDeadline: number,
        deliveryDeadline: number,
        agreedAmount: number,
        tokenAddress: string,
        metadata: OrderTradeMetadata,
        urlStructure: URLStructure,
        delegatedOrganizationIds: number[] = []
    ): Promise<[number, string, string]> {
        return this.registerTrade(
            (externalUrl: string, fileHash: string) =>
                this._tradeManagerDriver.registerOrderTrade(
                    supplier,
                    customer,
                    commissioner,
                    externalUrl,
                    fileHash,
                    paymentDeadline,
                    documentDeliveryDeadline,
                    arbiter,
                    shippingDeadline,
                    deliveryDeadline,
                    agreedAmount,
                    tokenAddress
                ),
            metadata,
            urlStructure,
            delegatedOrganizationIds
        );
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

    private async registerTrade(
        registerCallback: RegisterTradeCallback,
        metadata: BasicTradeMetadata | OrderTradeMetadata,
        urlStructure: URLStructure,
        delegatedOrganizationIds: number[] = []
    ): Promise<[number, string, string]> {
        if (!this._icpFileDriver)
            throw new Error('TradeManagerService: ICPFileDriver has not been set');

        const externalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.TRANSACTION}`;
        const bytes = FileHelpers.getBytesFromObject(metadata);
        const fileHash = FileHelpers.getHash(bytes);

        const [newTradeId, newTradeAddress, transactionHash] = await registerCallback(
            externalUrl,
            fileHash.toString()
        );

        const newExternalUrl = externalUrl + newTradeId;
        const name = `${newExternalUrl}/${URL_SEGMENTS.FILE}metadata.json`;
        const resourceSpec: ICPResourceSpec = {
            name,
            type: 'application/json'
        };
        await this._icpFileDriver.create(bytes, resourceSpec, delegatedOrganizationIds);

        return [newTradeId, newTradeAddress, transactionHash];
    }
}
