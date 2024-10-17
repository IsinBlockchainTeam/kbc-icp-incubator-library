import {RoleProof} from "@kbc-lib/azle-types";
import {OrderDriver, OrderParams} from "../../drivers/icp/OrderDriver";
import {Order} from "../../entities/icp/Order";

export class OrderService {
    private readonly _orderDriver: OrderDriver;

    constructor(orderDriver: OrderDriver) {
        this._orderDriver = orderDriver;
    }

    async getOrders(roleProof: RoleProof): Promise<Order[]> {
        return this._orderDriver.getOrders(roleProof);
    }

    async getOrder(roleProof: RoleProof, id: number): Promise<Order> {
        return this._orderDriver.getOrder(roleProof, id);
    }

    async createOrder(roleProof: RoleProof, params: OrderParams): Promise<Order> {
        return this._orderDriver.createOrder(roleProof, params);
    }

    async updateOrder(roleProof: RoleProof, id: number, params: OrderParams): Promise<Order> {
        return this._orderDriver.updateOrder(roleProof, id, params);
    }

    async signOrder(roleProof: RoleProof, id: number): Promise<Order> {
        return this._orderDriver.signOrder(roleProof, id);
    }
}
