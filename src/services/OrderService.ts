import { OrderDriver, OrderParams } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';

export class OrderService {
    private readonly _orderDriver: OrderDriver;

    constructor(orderDriver: OrderDriver) {
        this._orderDriver = orderDriver;
    }

    async getOrders(): Promise<Order[]> {
        return this._orderDriver.getOrders();
    }

    async getOrder(id: number): Promise<Order> {
        return this._orderDriver.getOrder(id);
    }

    async createOrder(params: OrderParams): Promise<Order> {
        return this._orderDriver.createOrder(params);
    }

    async updateOrder(id: number, params: OrderParams): Promise<Order> {
        return this._orderDriver.updateOrder(id, params);
    }

    async signOrder(id: number): Promise<Order> {
        return this._orderDriver.signOrder(id);
    }
}
