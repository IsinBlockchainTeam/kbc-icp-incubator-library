import { BigNumber, Event, Signer, utils } from 'ethers';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { TradeType } from '../types/TradeType';
import { getTradeTypeByIndex } from '../utils/utils';
import { BasicTradeDriver } from './BasicTradeDriver';
import { OrderTradeDriver } from './OrderTradeDriver';
import { Line, Trade } from '../entities/Trade';
import { IConcreteTradeDriverInterface } from './IConcreteTradeDriver.interface';

export class TradeManagerDriver {
    private _contract: TradeManager;

    private readonly _materialManagerAddress: string;

    private readonly _productCategoryManagerAddress: string;

    constructor(signer: Signer, tradeManagerAddress: string, materialManagerAddress: string, productCategoryManagerAddress: string) {
        this._contract = TradeManager__factory
            .connect(tradeManagerAddress, signer.provider!)
            .connect(signer);
        this._materialManagerAddress = materialManagerAddress;
        this._productCategoryManagerAddress = productCategoryManagerAddress;
    }

    async registerBasicTrade(supplier: string, customer: string, commissioner: string, externalUrl: string, name: string): Promise<[number, string, string]> {
        if (!utils.isAddress(supplier) || !utils.isAddress(customer) || !utils.isAddress(commissioner)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerBasicTrade(supplier, customer, commissioner, externalUrl, name);
        const { events, transactionHash } = await tx.wait();

        if (!events) {
            throw new Error('Error during basic trade registration, no events found');
        }
        const eventArgs = events.find((event: Event) => event.event === 'BasicTradeRegistered')?.args;
        return [eventArgs?.id.toNumber(), eventArgs?.contractAddress, transactionHash];
    }

    async registerOrderTrade(supplier: string, customer: string, commissioner: string, externalUrl: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string): Promise<[number, string, string]> {
        if (!utils.isAddress(supplier) || !utils.isAddress(customer) || !utils.isAddress(commissioner) || !utils.isAddress(tokenAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
        const { events, transactionHash } = await tx.wait();

        if (!events) {
            throw new Error('Error during order registration, no events found');
        }
        const eventArgs = events.find((event: Event) => event.event === 'OrderTradeRegistered')?.args;
        return [eventArgs?.id.toNumber(), eventArgs?.contractAddress, transactionHash];
    }

    async getTradeCounter(): Promise<number> {
        return (await this._contract.getTradeCounter()).toNumber();
    }

    async getTrades(): Promise<Trade[]> {
        const tradeCounter: number = await this.getTradeCounter();

        const tradesPromises: Promise<Trade>[] = Array.from({ length: tradeCounter }, async (_, i) => {
            const index = i + 1;
            const tradeType: TradeType = await this.getTradeType(index);
            const tradeDriver: IConcreteTradeDriverInterface = tradeType === TradeType.BASIC ?
                new BasicTradeDriver(this._contract.signer, await this._contract.getTrade(index), this._materialManagerAddress, this._productCategoryManagerAddress) :
                new OrderTradeDriver(this._contract.signer, await this._contract.getTrade(index), this._materialManagerAddress, this._productCategoryManagerAddress);
            return tradeDriver.getTrade();
        });

        return Promise.all(tradesPromises);
    }

    async getTradeType(id: number): Promise<TradeType> {
        const result = await this._contract.getTradeType(id);
        return getTradeTypeByIndex(result);
    }

    async getTradesAndTypes(): Promise<Map<string, TradeType>> {
        const tradeCounter: number = await this.getTradeCounter();

        const tradesPromises: Promise<[string, TradeType]>[] = Array.from({ length: tradeCounter }, async (_, i) => {
            const index = i + 1;
            return [
                await this._contract.getTrade(index),
                await this.getTradeType(index),
            ] as [string, TradeType];
        });

        const trades: [string, TradeType][] = await Promise.all(tradesPromises);

        return new Map<string, TradeType>(trades);
    }

    async getTrade(id: number): Promise<string> {
        return this._contract.getTrade(id);
    }

    async getTradesByMaterial(materialId: number): Promise<Trade[]> {
        const trades: Trade[] = await this.getTrades();
        return trades.filter((trade: Trade) => trade.lines.some((line: Line) => line.material!.id === materialId));
    }

    async getTradeIdsOfSupplier(commissioner: string): Promise<number[]> {
        const tradesId = await this._contract.getTradeIdsOfSupplier(commissioner);
        return tradesId.map((id: BigNumber) => id.toNumber());
    }

    async getTradeIdsOfCommissioner(commissioner: string): Promise<number[]> {
        const tradesId = await this._contract.getTradeIdsOfCommissioner(commissioner);
        return tradesId.map((id: BigNumber) => id.toNumber());
    }
}
