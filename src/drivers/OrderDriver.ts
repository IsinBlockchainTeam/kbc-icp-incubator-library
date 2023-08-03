/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { JsonRpcProvider } from '@ethersproject/providers';
import { IdentityEthersDriver } from '@blockchain-lib/common';
import { utils } from 'ethers';
import { OrderManager, OrderManager__factory } from '../smart-contracts';
import { Order } from '../entities/Order';
import { OrderLine } from '../entities/OrderLine';

export type OrderSignatures = {
    offerorSigned: boolean,
    offereeSigned: boolean
}

export class OrderDriver {
    protected _contract: OrderManager;

    constructor(
        identityDriver: IdentityEthersDriver,
        provider: JsonRpcProvider,
        orderAddress: string,
    ) {
        this._contract = OrderManager__factory
            .connect(orderAddress, provider)
            .connect(identityDriver.wallet);
    }

    async registerOrder(order: Order): Promise<void> {
        if (!utils.isAddress(order.supplier)) {
            throw new Error('Not an address');
        }
        try {
            const tx = await this._contract.registerOrder(
                order.supplier,
                order.contractId,
                order.externalUrl,
            );
            const receipt = await tx.wait();
            if (receipt.events) {
                const registerEvent = receipt.events.find((event) => event.event === 'OrderRegistered');
                if (registerEvent) {
                    const decodedEvent = this._contract.interface.decodeEventLog('OrderRegistered', registerEvent.data, registerEvent.topics);
                    const savedOrderId = decodedEvent.id.toNumber();
                    for (let i = 0; i < order.lines.length; i++) {
                        const orderLine = order.lines[i];
                        await this.addOrderLine(order.supplier, savedOrderId, orderLine);
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

    async getOrderInfo(supplierAddress: string, id: number): Promise<Order> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
        try {
            const {
                id: orderId,
                contractId,
                externalUrl,
                lineIds,
            } = await this._contract.getOrderInfo(supplierAddress, id);
            return new Order(orderId.toNumber(), supplierAddress, contractId.toNumber(), externalUrl, lineIds.map((l) => l.toNumber()));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async orderExists(supplierAddress: string, orderId: number): Promise<boolean> {
        return this._contract.orderExists(supplierAddress, orderId);
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number): Promise<OrderLine> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
        try {
            const rawOrderLine = await this._contract.getOrderLine(supplierAddress, orderId, orderLineId);
            return new OrderLine(
                rawOrderLine.id.toNumber(),
                rawOrderLine.contractLineId.toNumber(),
                rawOrderLine.quantity.toNumber(),
            );
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addOrderLine(supplierAddress: string, orderId: number, orderLine: OrderLine): Promise<void> {
        try {
            const rawOrderLine: OrderManager.OrderLineStruct = {
                id: 0,
                contractLineId: orderLine.contractLineId,
                quantity: orderLine.quantity,
                exists: true,
            };
            const tx = await this._contract.addOrderLine(
                supplierAddress,
                orderId,
                rawOrderLine,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
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
