/* eslint-disable camelcase */
/* eslint-disable no-await-in-loop */
import { JsonRpcProvider } from '@ethersproject/providers';
import { IdentityEthersDriver } from '@blockchain-lib/common';
import { utils } from 'ethers';
import { OrderManager, OrderManager__factory } from '../smart-contracts';
import { Order } from '../entities/Order';
import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { OrderStatus } from '../types/OrderStatus';
import { EntityBuilder } from '../utils/EntityBuilder';

export enum OrderEvents {
    OrderRegistered,
    OrderLineAdded,
    OrderLineUpdated,
}

export class OrderDriver {
    protected _contract: OrderManager;

    constructor(
        identityDriver: IdentityEthersDriver,
        provider: JsonRpcProvider,
        contractAddress: string,
    ) {
        this._contract = OrderManager__factory
            .connect(contractAddress, provider)
            .connect(identityDriver.wallet);
    }

    async registerOrder(supplierAddress: string, customerAddress: string, offereeAddress: string, externalUrl: string, lines?: OrderLine[]): Promise<void> {
        if (!utils.isAddress(supplierAddress)) throw new Error('Supplier not an address');
        if (!utils.isAddress(customerAddress)) throw new Error('Customer not an address');
        if (!utils.isAddress(offereeAddress)) throw new Error('Offeree not an address');

        try {
            const tx = await this._contract.registerOrder(
                supplierAddress,
                customerAddress,
                offereeAddress,
                externalUrl,
            );
            const receipt = await tx.wait();
            if (lines && receipt.events) {
                const registerEvent = receipt.events.find((event) => event.event === 'OrderRegistered');
                if (registerEvent) {
                    const decodedEvent = this._contract.interface.decodeEventLog('OrderRegistered', registerEvent.data, registerEvent.topics);
                    const savedOrderId = decodedEvent.id.toNumber();
                    for (let i = 0; i < lines.length; i++) {
                        const orderLine = lines[i];
                        await this.addOrderLine(supplierAddress, savedOrderId, orderLine.productCategory, orderLine.quantity, orderLine.price);
                    }
                }
            }
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getOrderCounter(supplierAddress: string): Promise<number> {
        const counter = await this._contract.getOrderCounter(supplierAddress);
        return counter.toNumber();
    }

    async getOrderInfo(supplierAddress: string, id: number, blockNumber?: number): Promise<Order> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
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

    async getOrderStatus(supplierAddress: string, orderId: number): Promise<OrderStatus> {
        if (!utils.isAddress(supplierAddress)) { throw new Error('Not an address'); }
        return this._contract.getOrderStatus(supplierAddress, orderId);
    }

    async orderExists(supplierAddress: string, orderId: number): Promise<boolean> {
        return this._contract.orderExists(supplierAddress, orderId);
    }

    async confirmOrder(supplierAddress: string, orderId: number): Promise<void> {
        await this._contract.confirmOrder(supplierAddress, orderId);
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
        try {
            const rawOrderLine = await this._contract.getOrderLine(supplierAddress, orderId, orderLineId, { blockTag: blockNumber });
            return EntityBuilder.buildOrderLine(rawOrderLine);
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderLine(supplierAddress: string, orderId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: OrderManager.OrderLinePriceStruct = {
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
        try {
            const priceDecimals = price.amount.toString().split('.')[1]?.length || 0;
            const rawOrderLinePrice: OrderManager.OrderLinePriceStruct = {
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

    async getBlockNumbersByOrderId(id: number): Promise<Map<OrderEvents, number[]>> {
        const totalEvents = await Promise.all([
            this._contract.queryFilter(this._contract.filters.OrderRegistered(id)),
            this._contract.queryFilter(this._contract.filters.OrderLineAdded(id)),
            this._contract.queryFilter(this._contract.filters.OrderLineUpdated(id)),
        ]);

        return totalEvents.reduce((map, events) => {
            const eventName = events[0].event!;
            map.set(OrderEvents[eventName as keyof typeof OrderEvents], events.map((e) => e.blockNumber));
            return map;
        }, new Map<OrderEvents, number[]>());
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) {
            throw new Error('Not an address');
        }
        try {
            const tx = await this._contract.addAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) {
            throw new Error('Not an address');
        }
        try {
            const tx = await this._contract.removeAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
