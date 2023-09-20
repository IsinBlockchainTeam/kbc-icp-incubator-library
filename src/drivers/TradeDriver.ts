/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { OrderInfo } from '../entities/OrderInfo';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { EntityBuilder } from '../utils/EntityBuilder';
import { serial } from '../utils/utils';
import { TradeType } from '../entities/Trade';
import { BasicTrade } from '../entities/BasicTrade';
import { TradeLine } from '../entities/TradeLine';

export enum TradeEvents {
    TradeRegistered,
    TradeLineAdded,
    TradeLineUpdated,
    OrderLineAdded,
    OrderLineUpdated,
}

export class TradeDriver {
    private _contract: TradeManager;

    constructor(
        signer: Signer,
        contractAddress: string,
    ) {
        this._contract = TradeManager__factory
            .connect(contractAddress, signer.provider!)
            .connect(signer);
    }

    async registerTrade(tradeType: TradeType, supplierAddress: string, customerAddress: string, name: string, externalUrl?: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        if (!utils.isAddress(customerAddress)) throw new Error('Customer not an address');

        try {
            const tx = await this._contract.registerTrade(tradeType, supplierAddress, customerAddress, name, externalUrl || '');
            await tx.wait();
            // const receipt = await tx.wait();
            // if (lines && receipt.events) {
            //     const registerEvent = receipt.events.find((event) => event.event === 'OrderRegistered');
            //     if (registerEvent) {
            //         const decodedEvent = this._contract.interface.decodeEventLog('OrderRegistered', registerEvent.data, registerEvent.topics);
            //         const savedOrderId = decodedEvent.id.toNumber();
            //         for (let i = 0; i < lines.length; i++) {
            //             const orderLine = lines[i];
            //             await this.addOrderLine(supplierAddress, savedOrderId, orderLine.productCategory, orderLine.quantity, orderLine.price);
            //         }
            //     }
            // }
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async tradeExists(supplierAddress: string, orderId: number): Promise<boolean> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        return this._contract.tradeExists(supplierAddress, orderId);
    }

    async getTradeInfo(supplierAddress: string, tradeId: number, blockNumber?: number): Promise<BasicTrade> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        try {
            const rawTrade = await this._contract.getTradeInfo(supplierAddress, tradeId, { blockTag: blockNumber });
            return EntityBuilder.buildBasicTrade(rawTrade);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTradeCounter(supplierAddress: string): Promise<number> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        const counter = await this._contract.getTradeCounter(supplierAddress);
        return counter.toNumber();
    }

    async addTradeLine(supplierAddress: string, tradeId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        try {
            const tx = await this._contract.addTradeLine(supplierAddress, tradeId, materialIds, productCategory);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addTradeLines(supplierAddress: string, tradeId: number, lines: TradeLine[]): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        const tradeLineFunctions = lines.map((line) => async () => {
            await this.addTradeLine(supplierAddress, tradeId, line.materialIds, line.productCategory);
        });
        await serial(tradeLineFunctions);
    }

    async updateTradeLine(supplierAddress: string, tradeId: number, tradeLineId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        try {
            const tx = await this._contract.updateTradeLine(supplierAddress, tradeId, tradeLineId, materialIds, productCategory);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTradeLine(supplierAddress: string, tradeId: number, tradeLineId: number): Promise<TradeLine> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        try {
            const rawTradeLine = await this._contract.getTradeLine(supplierAddress, tradeId, tradeLineId);
            return EntityBuilder.buildTradeLine(rawTradeLine);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async tradeLineExists(supplierAddress: string, tradeId: number, tradeLineId: number): Promise<boolean> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        return this._contract.tradeLineExists(supplierAddress, tradeId, tradeLineId);
    }

    async addOrderOfferee(supplierAddress: string, orderId: number, offeree: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        try {
            const tx = await this._contract.addOrderOfferee(supplierAddress, orderId, offeree);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderPaymentDeadline(supplierAddress: string, id: number, paymentDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.setOrderPaymentDeadline(supplierAddress, id, paymentDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderDocumentDeliveryDeadline(supplierAddress: string, id: number, documentDeliveryDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.setOrderDocumentDeliveryDeadline(supplierAddress, id, documentDeliveryDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderArbiter(supplierAddress: string, id: number, arbiter: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.setOrderArbiter(supplierAddress, id, arbiter);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderShippingDeadline(supplierAddress: string, id: number, shippingDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.setOrderShippingDeadline(supplierAddress, id, shippingDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderDeliveryDeadline(supplierAddress: string, id: number, deliveryDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.setOrderDeliveryDeadline(supplierAddress, id, deliveryDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async confirmOrder(supplierAddress: string, orderId: number): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.confirmOrder(supplierAddress, orderId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addDocument(supplierAddress: string, tradeId: number, documentName: string, documentType: string, documentExternalUrl: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const tx = await this._contract.addDocument(supplierAddress, tradeId, documentName, documentType, documentExternalUrl);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getNegotiationStatus(supplierAddress: string, orderId: number): Promise<NegotiationStatus> {
        if (!utils.isAddress(supplierAddress)) { throw new Error('Supplier not an address'); }

        try {
            return this._contract.getNegotiationStatus(supplierAddress, orderId);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOrderInfo(supplierAddress: string, id: number, blockNumber?: number): Promise<OrderInfo> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const order = await this._contract.getOrderInfo(supplierAddress, id, { blockTag: blockNumber });
            return EntityBuilder.buildOrderInfo(order);
            // const lines: OrderLine[] = (rawLines || []).map((rcl) => new OrderLine(
            //     rcl.id.toNumber(),
            //     rcl.productCategory.toString(),
            //     rcl.quantity.toNumber(),
            //     {
            //         amount: rcl.price.amount.toNumber() / BigNumber.from(10)
            //             .pow(rcl.price.decimals)
            //             .toNumber(),
            //         fiat: rcl.price.fiat,
            //     },
            // ));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async isSupplierOrCustomer(supplierAddress: string, orderId: number, senderAddress: string): Promise<boolean> {
        if (!utils.isAddress(supplierAddress)) { throw new Error('Supplier not an address'); }
        if (!utils.isAddress(senderAddress)) { throw new Error('Sender not an address'); }

        try {
            return this._contract.isSupplierOrCustomer(supplierAddress, orderId, senderAddress);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderLine(supplierAddress: string, orderId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: TradeManager.OrderLinePriceStruct = {
                amount: price.amount * (10 ** priceDecimals),
                decimals: priceDecimals,
                fiat: price.fiat,
            };
            const tx = await this._contract.addOrderLine(supplierAddress, orderId, materialIds, productCategory, quantity, rawOrderLinePrice);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderLines(supplierAddress: string, orderId: number, lines: OrderLine[]): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        const orderLineFunctions = lines.map((line) => async () => {
            await this.addOrderLine(supplierAddress, orderId, line.materialIds, line.productCategory, line.quantity, line.price);
        });
        await serial(orderLineFunctions);
    }

    async updateOrderLine(supplierAddress: string, orderId: number, orderLineId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: TradeManager.OrderLinePriceStruct = {
                amount: price.amount * (10 ** priceDecimals),
                decimals: priceDecimals,
                fiat: price.fiat,
            };
            const tx = await this._contract.updateOrderLine(supplierAddress, orderId, orderLineId, materialIds, productCategory, quantity, rawOrderLinePrice);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');

        try {
            const rawOrderLine = await this._contract.getOrderLine(supplierAddress, orderId, orderLineId, { blockTag: blockNumber });
            return EntityBuilder.buildOrderLine(rawOrderLine);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getBlockNumbersByTradeId(id: number): Promise<Map<TradeEvents, number[]>> {
        const totalEvents = await Promise.all([
            this._contract.queryFilter(this._contract.filters.TradeRegistered(id)),
            this._contract.queryFilter(this._contract.filters.TradeLineAdded(id)),
            this._contract.queryFilter(this._contract.filters.TradeLineUpdated(id)),
            this._contract.queryFilter(this._contract.filters.OrderLineAdded(id)),
            this._contract.queryFilter(this._contract.filters.OrderLineUpdated(id)),
        ]);

        return totalEvents.reduce((map, events) => {
            const eventName = events[0].event!;
            map.set(TradeEvents[eventName as keyof typeof TradeEvents], events.map((e) => e.blockNumber));
            return map;
        }, new Map<TradeEvents, number[]>());
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');

        try {
            const tx = await this._contract.addAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) throw new Error('Not an address');

        try {
            const tx = await this._contract.removeAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
