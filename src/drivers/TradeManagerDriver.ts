import { BigNumber, Event, Signer, utils } from 'ethers';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { TradeType } from '../types/TradeType';
import { getTradeTypeByIndex } from '../utils/utils';
import { BasicTradeDriver } from './BasicTradeDriver';
import { BasicTrade } from '../entities/BasicTrade';
import { OrderTrade } from '../entities/OrderTrade';
import { OrderTradeDriver } from './OrderTradeDriver';

export class TradeManagerDriver {
    private _contract: TradeManager;

    private _materialManagerAddress: string;

    private _productCategoryManagerAddress: string;

    constructor(signer: Signer, tradeManagerAddress: string, materialManagerAddress: string, productCategoryManagerAddress: string) {
        this._contract = TradeManager__factory
            .connect(tradeManagerAddress, signer.provider!)
            .connect(signer);
        this._materialManagerAddress = materialManagerAddress;
        this._productCategoryManagerAddress = productCategoryManagerAddress;
    }

    async registerBasicTrade(supplier: string, customer: string, commissioner: string, externalUrl: string, name: string): Promise<BasicTrade> {
        if (!utils.isAddress(supplier) || !utils.isAddress(customer) || !utils.isAddress(commissioner)) {
            throw new Error('Not an address');
        }
        const tx: any = await this._contract.registerBasicTrade(supplier, customer, commissioner, externalUrl, name);
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during basic trade registration, no events found');
        }
        const id: number = events.find((event: Event) => event.event === 'BasicTradeRegistered').args.id.toNumber();
        const tradeDriver: BasicTradeDriver = new BasicTradeDriver(this._contract.signer, await this._contract.getTrade(id), this._materialManagerAddress, this._productCategoryManagerAddress);
        return tradeDriver.getTrade();
    }

    async registerOrderTrade(supplier: string, customer: string, commissioner: string, externalUrl: string, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, agreedAmount: number, tokenAddress: string): Promise<OrderTrade> {
        if (!utils.isAddress(supplier) || !utils.isAddress(customer) || !utils.isAddress(commissioner) || !utils.isAddress(tokenAddress)) {
            throw new Error('Not an address');
        }
        const tx: any = await this._contract.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during order registration, no events found');
        }
        const id: number = events.find((event: Event) => event.event === 'OrderTradeRegistered').args.id.toNumber();
        const tradeDriver: OrderTradeDriver = new OrderTradeDriver(this._contract.signer, await this._contract.getTrade(id), this._materialManagerAddress, this._productCategoryManagerAddress);
        return tradeDriver.getTrade();
    }

    async getTrades(): Promise<string[]> {
        const trades: string[] = [];
        const tradeCounter: number = (await this._contract.getTradeCounter()).toNumber();

        for (let i: number = 0; i < tradeCounter; i++) {
            trades.push(await this._contract.getTrade(i));
        }
        return trades;
    }

    async getTradesAndTypes(): Promise<Map<string, TradeType>> {
        const result: Map<string, TradeType> = new Map<string, TradeType>();
        const tradeCounter: number = (await this._contract.getTradeCounter()).toNumber();

        for (let i: number = 0; i < tradeCounter; i++) {
            const tradeAddress: string = await this._contract.getTrade(i);
            const tradeType: TradeType = getTradeTypeByIndex(await this._contract.getTradeType(i));
            result.set(tradeAddress, tradeType);
        }
        return result;
    }

    async getTrade(id: number): Promise<string> {
        return this._contract.getTrade(id);
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
