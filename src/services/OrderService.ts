import { OrderLine } from '../entities/OrderLine';
import { OrderDriver } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';

export class OrderService {
    private _orderDriver: OrderDriver;

    constructor(orderDriver: OrderDriver) {
        this._orderDriver = orderDriver;
    }

    async registerOrder(order: Order): Promise<void> {
        await this._orderDriver.registerOrder(order);
    }

    async getOrderCounter(supplierAddress: string): Promise<number> {
        return this._orderDriver.getOrderCounter(supplierAddress);
    }

    async getOrderInfo(supplierAddress: string, id: number): Promise<Order> {
        return this._orderDriver.getOrderInfo(supplierAddress, id);
    }

    async orderExists(supplierAddress: string, id: number): Promise<boolean> {
        return this._orderDriver.orderExists(supplierAddress, id);
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number): Promise<OrderLine> {
        return this._orderDriver.getOrderLine(supplierAddress, orderId, orderLineId);
    }

    async addOrderLine(supplierAddress: string, orderId: number, orderLine: OrderLine): Promise<void> {
        return this._orderDriver.addOrderLine(supplierAddress, orderId, orderLine);
    }

    async addAdmin(address: string): Promise<void> {
        await this._orderDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._orderDriver.removeAdmin(address);
    }
}

export default OrderService;
