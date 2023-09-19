/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import { Signer, utils } from 'ethers';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { Order } from '../entities/Order';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { NegotiationStatus } from '../types/NegotiationStatus';
import { EntityBuilder } from '../utils/EntityBuilder';
import { serial } from '../utils/utils';

export enum TradeEvents {
    TradeRegistered,
    TradeLineAdded,
    TradeLineUpdated,
    OrderLineAdded,
    OrderLineUpdated,
}

export class TradeDriver {
    protected _contract: TradeManager;

    constructor(
        signer: Signer,
        contractAddress: string,
    ) {
        this._contract = TradeManager__factory
            .connect(contractAddress, signer.provider!)
            .connect(signer);
    }

    async registerTrade(tradeType: TradeType, supplierAddress: string, customerAddress: string, name: string, externalUrl: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        if (!utils.isAddress(customerAddress)) throw new Error('Customer not an address');

        try {
            const tx = await this._contract.registerTrade(
                tradeType,
                supplierAddress,
                customerAddress,
                name,
                externalUrl,
            );
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

    async getTradeInfo(supplierAddress: string, tradeId: number): Promise<Trade> {

    }

    async addOrderLines(supplierAddress: string, orderId: number, lines: OrderLine[]): Promise<void> {
        const orderLineFunctions = lines.map((line) => async () => {
            await this.addOrderLine(supplierAddress, orderId, line.productCategory, line.quantity, line.price);
        });
        await serial(orderLineFunctions);
    }

    async getTradeCounter(supplierAddress: string): Promise<number> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const counter = await this._contract.getTradeCounter(supplierAddress);
        return counter.toNumber();
    }

    async setOrderIncoterms(supplierAddress: string, id: number, incoterms: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderIncoterms(supplierAddress, id, incoterms);
        await tx.wait();
    }

    async setOrderPaymentDeadline(supplierAddress: string, id: number, paymentDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderPaymentDeadline(supplierAddress, id, paymentDeadline.getTime());
        await tx.wait();
    }

    async setOrderDocumentDeliveryDeadline(supplierAddress: string, id: number, documentDeliveryDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderDocumentDeliveryDeadline(supplierAddress, id, documentDeliveryDeadline.getTime());
        await tx.wait();
    }

    async setOrderShipper(supplierAddress: string, id: number, shipper: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderShipper(supplierAddress, id, shipper);
        await tx.wait();
    }

    async setOrderArbiter(supplierAddress: string, id: number, arbiter: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderArbiter(supplierAddress, id, arbiter);
        await tx.wait();
    }

    async setOrderShippingPort(supplierAddress: string, id: number, shippingPort: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderShippingPort(supplierAddress, id, shippingPort);
        await tx.wait();
    }

    async setOrderShippingDeadline(supplierAddress: string, id: number, shippingDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderShippingDeadline(supplierAddress, id, shippingDeadline.getTime());
        await tx.wait();
    }

    async setOrderDeliveryPort(supplierAddress: string, id: number, deliveryPort: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderDeliveryPort(supplierAddress, id, deliveryPort);
        await tx.wait();
    }

    async setOrderDeliveryDeadline(supplierAddress: string, id: number, deliveryDeadline: Date): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.setOrderDeliveryDeadline(supplierAddress, id, deliveryDeadline.getTime());
        await tx.wait();
    }

    async getOrderInfo(supplierAddress: string, id: number, blockNumber?: number): Promise<Order> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        try {
            const order = await this._contract.getOrderInfo(supplierAddress, id, { blockTag: blockNumber });
            return EntityBuilder.buildOrder(order);
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
        return this._contract.isSupplierOrCustomer(supplierAddress, orderId, senderAddress);
    }

    async getNegotiationStatus(supplierAddress: string, orderId: number): Promise<NegotiationStatus> {
        if (!utils.isAddress(supplierAddress)) { throw new Error('Not an address'); }
        return this._contract.getNegotiationStatus(supplierAddress, orderId);
    }

    async orderExists(supplierAddress: string, orderId: number): Promise<boolean> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        return this._contract.orderExists(supplierAddress, orderId);
    }

    async confirmOrder(supplierAddress: string, orderId: number): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.confirmOrder(supplierAddress, orderId);
        await tx.wait();
    }

    async addDocument(supplierAddress: string, orderId: number, orderStatus: string, documentName: string, documentType: string, documentExternalUrl: string): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        const tx = await this._contract.addDocument(supplierAddress, orderId, orderStatus, documentName, documentType, documentExternalUrl);
        await tx.wait();
    }

    async getTradeLine(supplierAddress: string, orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
        try {
            const rawOrderLine = await this._contract.getTradeLine(supplierAddress, orderId, orderLineId, { blockTag: blockNumber });
            return EntityBuilder.buildOrderLine(rawOrderLine);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderLine(supplierAddress: string, orderId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: TradeManager.OrderLinePriceStruct = {
                amount: price.amount * (10 ** priceDecimals),
                decimals: priceDecimals,
                fiat: price.fiat,
            };
            const tx = await this._contract.addOrderLine(
                supplierAddress,
                orderId,
                productCategory,
                quantity,
                rawOrderLinePrice,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateOrderLine(supplierAddress: string, orderId: number, orderLineId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Not an address');

        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: TradeManager.OrderLinePriceStruct = {
                amount: price.amount * (10 ** priceDecimals),
                decimals: priceDecimals,
                fiat: price.fiat,
            };
            const tx = await this._contract.updateOrderLine(
                supplierAddress,
                orderId,
                orderLineId,
                productCategory,
                quantity,
                rawOrderLinePrice,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getBlockNumbersByOrderId(id: number): Promise<Map<TradeEvents, number[]>> {
        const totalEvents = await Promise.all([
            this._contract.queryFilter(this._contract.filters.OrderRegistered(id)),
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
