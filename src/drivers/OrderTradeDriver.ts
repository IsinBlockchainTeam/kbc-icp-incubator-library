import { BigNumber, Signer } from 'ethers';
import { TradeDriver } from './TradeDriver';
// eslint-disable-next-line camelcase
import {
    OrderTrade,
    OrderTrade__factory,
} from '../smart-contracts';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { OrderLine, OrderLinePrice } from '../entities/OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';

export enum OrderTradeEvents {
    TradeLineAdded,
    TradeLineUpdated,
    OrderLineAdded,
    OrderLineUpdated,
    OrderSignatureAffixed,
    OrderConfirmed
}

export class OrderTradeDriver extends TradeDriver {
    private _actual: OrderTrade;

    constructor(signer: Signer, orderTradeAddress: string) {
        super(signer, orderTradeAddress);
        // eslint-disable-next-line camelcase
        this._actual = OrderTrade__factory
            .connect(orderTradeAddress, signer.provider!)
            .connect(signer);
    }

    async getLines(): Promise<OrderLine[]> {
        const result = await this._contract.getLines();
        const orderLines = await this._actual.getOrderLines();
        return result.map((line, index) => EntityBuilder.buildOrderLine(line, orderLines[index]));
    }

    async getLine(id: number, blockNumber?: number): Promise<OrderLine> {
        const line = await this._contract.getLine(id, { blockTag: blockNumber });
        const orderLine = await this._actual.getOrderLine(id, { blockTag: blockNumber });
        return EntityBuilder.buildOrderLine(line, orderLine);
    }

    async getOrderTrade(blockNumber?: number): Promise<{ tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lineIds: number[], hasSupplierSigned: boolean, hasCommissionerSigned: boolean, paymentDeadline: number, documentDeliveryDeadline: number, arbiter: string, shippingDeadline: number, deliveryDeadline: number, escrow: string}> {
        const result = await this._actual.getOrderTrade({ blockTag: blockNumber });

        return {
            tradeId: result[0].toNumber(),
            supplier: result[1],
            customer: result[2],
            commissioner: result[3],
            externalUrl: result[4],
            lineIds: result[5].map((value: BigNumber) => value.toNumber()),
            hasSupplierSigned: result[6],
            hasCommissionerSigned: result[7],
            paymentDeadline: result[8].toNumber(),
            documentDeliveryDeadline: result[9].toNumber(),
            arbiter: result[10],
            shippingDeadline: result[11].toNumber(),
            deliveryDeadline: result[12].toNumber(),
            escrow: result[13],
        };
    }

    async addOrderLine(materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        const _price = this._convertPriceClassInStruct(price);
        const tx = await this._actual.addOrderLine(materialIds, productCategory, quantity, _price);
        await tx.wait();
    }

    async updateOrderLine(id: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        const _price = this._convertPriceClassInStruct(price);
        let tx = await this._contract.updateLine(id, materialIds, productCategory);
        await tx.wait();
        tx = await this._actual.updateOrderLine(id, quantity, _price);
        await tx.wait();
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

    private _convertPriceClassInStruct(price: OrderLinePrice): OrderTrade.OrderLinePriceStructOutput {
        const _amount: number = Math.floor(price.amount);
        const str = (price.amount - _amount).toString().split('.')[1] || '0';
        const _decimals: number = parseInt(str, 10);

        return {
            amount: BigNumber.from(_amount),
            decimals: BigNumber.from(_decimals),
            fiat: price.fiat,
        } as OrderTrade.OrderLinePriceStructOutput;
    }
}
