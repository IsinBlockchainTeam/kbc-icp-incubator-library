import { BigNumber, Signer, Event } from 'ethers';
import { TradeDriver } from './TradeDriver';
// eslint-disable-next-line camelcase
import {
    OrderTrade as OrderTradeContract,
    OrderTrade__factory,
} from '../smart-contracts';
import { NegotiationStatus } from '../types/NegotiationStatus';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
} from '../entities/OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';
import { IConcreteTradeDriver } from './IConcreteTradeDriver';

export enum OrderTradeEvents {
    TradeLineAdded,
    TradeLineUpdated,
    OrderLineAdded,
    OrderLineUpdated,
    OrderSignatureAffixed,
    OrderConfirmed
}

export class OrderTradeDriver extends TradeDriver implements IConcreteTradeDriver {
    private _actual: OrderTradeContract;

    constructor(signer: Signer, orderTradeAddress: string) {
        super(signer, orderTradeAddress);
        // eslint-disable-next-line camelcase
        this._actual = OrderTrade__factory
            .connect(orderTradeAddress, signer.provider!)
            .connect(signer);
    }

    async getTrade(): Promise<OrderTrade> {
        const result = await this._actual.getTrade();
        const lines: OrderLine[] = await this.getLines();
        const linesMap: Map<number, OrderLine> = new Map<number, OrderLine>();
        lines?.forEach((line: OrderLine) => {
            linesMap.set(line.id, line);
        });

        return new OrderTrade(
            result[0].toNumber(),
            result[1],
            result[2],
            result[3],
            result[4],
            linesMap,
            result[6],
            result[7],
            result[8].toNumber(),
            result[9].toNumber(),
            result[10],
            result[11].toNumber(),
            result[12].toNumber(),
            result[13],
        );
    }

    async getLines(): Promise<OrderLine[]> {
        const result = await this._actual.getLines();
        const lines: OrderLine[] = [];
        for (let i: number = 0; i < result[0].length; i++) {
            lines.push(EntityBuilder.buildOrderLine(result[0][i], result[1][i]));
        }
        return lines;
    }

    async getLine(id: number, blockNumber?: number): Promise<OrderLine> {
        const line = await this._actual.getLine(id, { blockTag: blockNumber });
        return EntityBuilder.buildOrderLine(line[0], line[1]);
    }

    async addLine(line: OrderLineRequest): Promise<OrderLine> {
        const _price = this._convertPriceClassInStruct(line.price);
        const tx: any = await this._actual.addLine(line.materialsId, line.productCategory, line.quantity, _price);
        const receipt = await tx.wait();
        const id = receipt.events.find((event: Event) => event.event === 'OrderLineAdded').args[0];
        return this.getLine(id);
    }

    async updateLine(line: OrderLine): Promise<OrderLine> {
        const _price = this._convertPriceClassInStruct(line.price);
        const tx = await this._actual.updateLine(line.id, line.materialsId, line.productCategory, line.quantity, _price);
        await tx.wait();
        return this.getLine(line.id);
    }

    async getNegotiationStatus(): Promise<NegotiationStatus> {
        switch (await this._actual.getNegotiationStatus()) {
        case 0:
            return NegotiationStatus.INITIALIZED;
        case 1:
            return NegotiationStatus.PENDING;
        case 2:
            return NegotiationStatus.COMPLETED;
        default:
            throw new Error('Invalid state');
        }
    }

    async updatePaymentDeadline(paymentDeadline: number): Promise<void> {
        const tx = await this._actual.updatePaymentDeadline(paymentDeadline);
        await tx.wait();
    }

    async updateDocumentDeliveryDeadline(documentDeliveryDeadline: number): Promise<void> {
        const tx = await this._actual.updateDocumentDeliveryDeadline(documentDeliveryDeadline);
        await tx.wait();
    }

    async updateArbiter(arbiter: string): Promise<void> {
        const tx = await this._actual.updateArbiter(arbiter);
        await tx.wait();
    }

    async updateShippingDeadline(shippingDeadline: number): Promise<void> {
        const tx = await this._actual.updateShippingDeadline(shippingDeadline);
        await tx.wait();
    }

    async updateDeliveryDeadline(deliveryDeadline: number): Promise<void> {
        const tx = await this._actual.updateDeliveryDeadline(deliveryDeadline);
        await tx.wait();
    }

    async confirmOrder(): Promise<void> {
        const tx = await this._actual.confirmOrder();
        await tx.wait();
    }

    async getEmittedEvents(): Promise<Map<OrderTradeEvents, number[]>> {
        const emittedEvents = await Promise.all([
            this._actual.queryFilter(this._actual.filters.TradeLineAdded()),
            this._actual.queryFilter(this._actual.filters.TradeLineUpdated()),
            this._actual.queryFilter(this._actual.filters.OrderLineAdded()),
            this._actual.queryFilter(this._actual.filters.OrderLineUpdated()),
            this._actual.queryFilter(this._actual.filters.OrderSignatureAffixed()),
            this._actual.queryFilter(this._actual.filters.OrderConfirmed()),
        ]);

        return emittedEvents.reduce((map, events) => {
            if (events[0]?.event) {
                const eventName = events[0].event!;
                map.set(OrderTradeEvents[eventName as keyof typeof OrderTradeEvents], events.map((e) => e.blockNumber));
            }
            return map;
        }, new Map<OrderTradeEvents, number[]>());
    }

    private _convertPriceClassInStruct(price: OrderLinePrice): OrderTradeContract.OrderLinePriceStructOutput {
        const _amount: number = Math.floor(price.amount);
        const str = (price.amount - _amount).toString().split('.')[1] || '0';
        const _decimals: number = parseInt(str, 10);

        return {
            amount: BigNumber.from(_amount),
            decimals: BigNumber.from(_decimals),
            fiat: price.fiat,
        } as OrderTradeContract.OrderLinePriceStructOutput;
    }
}
