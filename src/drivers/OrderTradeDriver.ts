import { BigNumber, Signer, Event } from 'ethers';
import { TradeDriver } from './TradeDriver';
// eslint-disable-next-line camelcase
import {
    MaterialManager,
    MaterialManager__factory,
    OrderTrade as OrderTradeContract,
    OrderTrade__factory, ProductCategoryManager, ProductCategoryManager__factory,
} from '../smart-contracts';
import { NegotiationStatus } from '../types/NegotiationStatus';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
    OrderTrade,
} from '../entities/OrderTrade';
import { EntityBuilder } from '../utils/EntityBuilder';
import { IConcreteTradeDriverInterface } from './IConcreteTradeDriver.interface';

export enum OrderTradeEvents {
    TradeLineAdded,
    TradeLineUpdated,
    OrderLineAdded,
    OrderLineUpdated,
    OrderSignatureAffixed,
    OrderConfirmed
}

export class OrderTradeDriver extends TradeDriver implements IConcreteTradeDriverInterface {
    private _actual: OrderTradeContract;

    private _materialContract: MaterialManager;

    private _productCategoryContract: ProductCategoryManager;

    constructor(signer: Signer, orderTradeAddress: string, materialManagerAddress: string, productCategoryManagerAddress: string) {
        super(signer, orderTradeAddress);
        // eslint-disable-next-line camelcase
        this._actual = OrderTrade__factory
            .connect(orderTradeAddress, signer.provider!)
            .connect(signer);

        this._materialContract = MaterialManager__factory
            .connect(materialManagerAddress, signer.provider!)
            .connect(signer);

        this._productCategoryContract = ProductCategoryManager__factory
            .connect(productCategoryManagerAddress, signer.provider!)
            .connect(signer);
    }

    async getTrade(blockNumber?: number): Promise<OrderTrade> {
        const result = await this._actual.getTrade({ blockTag: blockNumber });
        const lines: OrderLine[] = await this.getLines();

        return new OrderTrade(
            result[0].toNumber(),
            result[1],
            result[2],
            result[3],
            result[4],
            lines,
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
        const counter: number = await this.getLineCounter();

        const promises = [];
        for (let i = 1; i <= counter; i++) {
            promises.push(this.getLine(i));
        }

        return Promise.all(promises);
    }

    async getLine(id: number, blockNumber?: number): Promise<OrderLine> {
        const line = await this._actual.getLine(id, { blockTag: blockNumber });

        let materialStruct: MaterialManager.MaterialStructOutput | undefined;
        if (line[0].materialId.toNumber() !== 0)
            materialStruct = await this._materialContract.getMaterial(line[0].materialId);

        return EntityBuilder.buildOrderLine(line[0], line[1], await this._productCategoryContract.getProductCategory(line[0].productCategoryId), materialStruct);
    }

    async addLine(line: OrderLineRequest): Promise<OrderLine> {
        const _price = this._convertPriceClassInStruct(line.price);
        const tx: any = await this._actual.addLine(line.productCategoryId, line.quantity, _price);
        const receipt = await tx.wait();
        const id = receipt.events.find((event: Event) => event.event === 'OrderLineAdded').args[0];
        return this.getLine(id);
    }

    async updateLine(line: OrderLine): Promise<OrderLine> {
        const _price = this._convertPriceClassInStruct(line.price);
        const tx = await this._actual.updateLine(line.id, line.productCategory.id, line.quantity, _price);
        await tx.wait();
        if (line.material)
            await this.assignMaterial(line.id, line.material.id);

        return this.getLine(line.id);
    }

    async assignMaterial(lineId: number, materialId: number): Promise<void> {
        const tx = await this._actual.assignMaterial(lineId, materialId);
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
