import {OrderLine, OrderLinePrice} from '../entities/OrderLine';
import { OrderDriver } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';
import { OrderStatus } from '../types/OrderStatus';

export class OrderService {
    private _orderDriver: OrderDriver;

    constructor(orderDriver: OrderDriver) {
        this._orderDriver = orderDriver;
    }

    async registerOrder(supplierAddress: string, customerAddress: string, offereeAddress: string, externalUrl: string, lines?: OrderLine[]): Promise<void> {
        await this._orderDriver.registerOrder(supplierAddress, customerAddress, offereeAddress, externalUrl, lines);
    }

    async getOrderCounter(supplierAddress: string): Promise<number> {
        return this._orderDriver.getOrderCounter(supplierAddress);
    }

    async getOrderInfo(supplierAddress: string, id: number): Promise<Order> {
        return this._orderDriver.getOrderInfo(supplierAddress, id);
    }

    async isSupplierOrCustomer(supplierAddress: string, id: number, senderAddress: string): Promise<boolean> {
        return this._orderDriver.isSupplierOrCustomer(supplierAddress, id, senderAddress);
    }

    async orderExists(supplierAddress: string, id: number): Promise<boolean> {
        return this._orderDriver.orderExists(supplierAddress, id);
    }

    async getOrderStatus(supplierAddress: string, id: number): Promise<OrderStatus> {
        return this._orderDriver.getOrderStatus(supplierAddress, id);
    }

    async confirmOrder(supplierAddress: string, id: number): Promise<void> {
        await this._orderDriver.confirmOrder(supplierAddress, id);
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number): Promise<OrderLine> {
        return this._orderDriver.getOrderLine(supplierAddress, orderId, orderLineId);
    }

    async updateOrderLine(supplierAddress: string, orderId: number, orderLineId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        return this._orderDriver.updateOrderLine(supplierAddress, orderId, orderLineId, productCategory, quantity, price);
    }

    async addOrderLine(supplierAddress: string, orderId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        return this._orderDriver.addOrderLine(supplierAddress, orderId, productCategory, quantity, price);
    }

    async addAdmin(address: string): Promise<void> {
        await this._orderDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._orderDriver.removeAdmin(address);
    }
}

export default OrderService;
