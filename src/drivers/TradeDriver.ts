/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { OrderInfo } from '../entities/OrderInfo';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Trade, TradeType } from '../entities/Trade';
import { BasicTradeInfo } from '../entities/BasicTradeInfo';
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

    async registerBasicTrade(supplierAddress: string, customerAddress: string, name: string, externalUrl?: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        if (!utils.isAddress(customerAddress)) throw new Error('Customer not an address');

        try {
            let tx = await this._contract.registerTrade(TradeType.TRADE, supplierAddress, customerAddress, externalUrl || '');
            const receipt = await tx.wait();
            if (receipt.events) {
                const registerEvent = receipt.events.find((event) => event.event === 'TradeRegistered');
                if (registerEvent) {
                    const decodedEvent = this._contract.interface.decodeEventLog('TradeRegistered', registerEvent.data, registerEvent.topics);
                    const savedTradeId = decodedEvent.id.toNumber();
                    tx = await this._contract.addTradeName(savedTradeId, name);
                    await tx.wait();
                }
            }
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async tradeExists(tradeId: number): Promise<boolean> {
        try {
            return this._contract.tradeExists(tradeId);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getCounter(): Promise<number> {
        try {
            const counter = await this._contract.getCounter();
            return counter.toNumber();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getGeneralTrade(tradeId: number, blockNumber?: number): Promise<Trade> {
        try {
            const rawTrade = await this._contract.getGeneralTrade(tradeId, { blockTag: blockNumber });
            return EntityBuilder.buildGeneralTrade(rawTrade);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getBasicTradeInfo(tradeId: number, blockNumber?: number): Promise<BasicTradeInfo> {
        try {
            const rawTrade = await this._contract.getTradeInfo(tradeId, { blockTag: blockNumber });
            return EntityBuilder.buildBasicTradeInfo(rawTrade);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTradeIds(supplierAddress: string): Promise<number[]> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        const ids = await this._contract.getTradeIds(supplierAddress);
        return ids.map((id) => id.toNumber());
    }

    async addTradeLine(tradeId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        try {
            const tx = await this._contract.addTradeLine(tradeId, materialIds, productCategory);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateTradeLine(tradeId: number, tradeLineId: number, materialIds: [number, number], productCategory: string): Promise<void> {
        try {
            const tx = await this._contract.updateTradeLine(tradeId, tradeLineId, materialIds, productCategory);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getTradeLine(tradeId: number, tradeLineId: number, blockNumber?: number): Promise<TradeLine> {
        try {
            const rawTradeLine = await this._contract.getTradeLine(tradeId, tradeLineId, { blockTag: blockNumber });
            return EntityBuilder.buildTradeLine(rawTradeLine);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async tradeLineExists(tradeId: number, tradeLineId: number): Promise<boolean> {
        try {
            return this._contract.tradeLineExists(tradeId, tradeLineId);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async registerOrder(supplierAddress: string, customerAddress: string, externalUrl?: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        if (!utils.isAddress(customerAddress)) throw new Error('Customer not an address');

        try {
            const tx = await this._contract.registerTrade(TradeType.ORDER, supplierAddress, customerAddress, externalUrl || '');
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderOfferee(orderId: number, offeree: string): Promise<void> {
        try {
            const tx = await this._contract.addOrderOfferee(orderId, offeree);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderPaymentDeadline(id: number, paymentDeadline: Date): Promise<void> {
        try {
            const tx = await this._contract.setOrderPaymentDeadline(id, paymentDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderDocumentDeliveryDeadline(id: number, documentDeliveryDeadline: Date): Promise<void> {
        try {
            const tx = await this._contract.setOrderDocumentDeliveryDeadline(id, documentDeliveryDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderArbiter(id: number, arbiter: string): Promise<void> {
        try {
            const tx = await this._contract.setOrderArbiter(id, arbiter);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderShippingDeadline(id: number, shippingDeadline: Date): Promise<void> {
        try {
            const tx = await this._contract.setOrderShippingDeadline(id, shippingDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async setOrderDeliveryDeadline(id: number, deliveryDeadline: Date): Promise<void> {
        try {
            const tx = await this._contract.setOrderDeliveryDeadline(id, deliveryDeadline.getTime());
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async confirmOrder(orderId: number): Promise<void> {
        try {
            const tx = await this._contract.confirmOrder(orderId);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addDocument(tradeId: number, documentName: string, documentType: string, documentExternalUrl: string): Promise<void> {
        try {
            const tx = await this._contract.addDocument(tradeId, documentName, documentType, documentExternalUrl);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getNegotiationStatus(orderId: number): Promise<NegotiationStatus> {
        try {
            return this._contract.getNegotiationStatus(orderId);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOrderInfo(id: number, blockNumber?: number): Promise<OrderInfo> {
        try {
            const rawOrder = await this._contract.getOrderInfo(id, { blockTag: blockNumber });
            return EntityBuilder.buildOrderInfo(rawOrder);
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

    async isSupplierOrCustomer(orderId: number, senderAddress: string): Promise<boolean> {
        if (!utils.isAddress(senderAddress)) { throw new Error('Sender not an address'); }

        try {
            return this._contract.isSupplierOrCustomer(orderId, senderAddress);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderLine(orderId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: TradeManager.OrderLinePriceStruct = {
                amount: price.amount * (10 ** priceDecimals),
                decimals: priceDecimals,
                fiat: price.fiat,
            };
            const tx = await this._contract.addOrderLine(orderId, materialIds, productCategory, quantity, rawOrderLinePrice);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateOrderLine(orderId: number, orderLineId: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: TradeManager.OrderLinePriceStruct = {
                amount: price.amount * (10 ** priceDecimals),
                decimals: priceDecimals,
                fiat: price.fiat,
            };
            const tx = await this._contract.updateOrderLine(orderId, orderLineId, materialIds, productCategory, quantity, rawOrderLinePrice);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOrderLine(orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        try {
            const rawOrderLine = await this._contract.getOrderLine(orderId, orderLineId, { blockTag: blockNumber });
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
            if (events[0]?.event) {
                const eventName = events[0].event!;
                map.set(TradeEvents[eventName as keyof typeof TradeEvents], events.map((e) => e.blockNumber));
            }
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
