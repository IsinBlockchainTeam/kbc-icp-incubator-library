import { OrderLine, OrderLinePrice } from '../entities/OrderLine';
import { OrderDriver, OrderEvents } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';
import { NegotiationStatus } from '../types/NegotiationStatus';

export class OrderService {
    private _orderDriver: OrderDriver;

    constructor(orderDriver: OrderDriver) {
        this._orderDriver = orderDriver;
    }

    async registerOrder(supplierAddress: string, customerAddress: string, offereeAddress: string, externalUrl: string): Promise<void> {
        await this._orderDriver.registerOrder(supplierAddress, customerAddress, offereeAddress, externalUrl);
    }

    async addOrderLines(supplierAddress: string, orderId: number, lines: OrderLine[]): Promise<void> {
        await this._orderDriver.addOrderLines(supplierAddress, orderId, lines);
    }

    async getOrderCounter(supplierAddress: string): Promise<number> {
        return this._orderDriver.getOrderCounter(supplierAddress);
    }

    async setOrderIncoterms(supplierAddress: string, id: number, incoterms: string): Promise<void> {
        await this._orderDriver.setOrderIncoterms(supplierAddress, id, incoterms);
    }

    async setOrderPaymentDeadline(supplierAddress: string, id: number, paymentDeadline: Date): Promise<void> {
        await this._orderDriver.setOrderPaymentDeadline(supplierAddress, id, paymentDeadline);
    }

    async setOrderDocumentDeliveryDeadline(supplierAddress: string, id: number, documentDeliveryDeadline: Date): Promise<void> {
        await this._orderDriver.setOrderDocumentDeliveryDeadline(supplierAddress, id, documentDeliveryDeadline);
    }

    async setOrderShipper(supplierAddress: string, id: number, shipper: string): Promise<void> {
        await this._orderDriver.setOrderShipper(supplierAddress, id, shipper);
    }

    async setOrderArbiter(supplierAddress: string, id: number, arbiter: string): Promise<void> {
        await this._orderDriver.setOrderArbiter(supplierAddress, id, arbiter);
    }

    async setOrderShippingPort(supplierAddress: string, id: number, shippingPort: string): Promise<void> {
        await this._orderDriver.setOrderShippingPort(supplierAddress, id, shippingPort);
    }

    async setOrderShippingDeadline(supplierAddress: string, id: number, shippingDeadline: Date): Promise<void> {
        await this._orderDriver.setOrderShippingDeadline(supplierAddress, id, shippingDeadline);
    }

    async setOrderDeliveryPort(supplierAddress: string, id: number, deliveryPort: string): Promise<void> {
        await this._orderDriver.setOrderDeliveryPort(supplierAddress, id, deliveryPort);
    }

    async setOrderDeliveryDeadline(supplierAddress: string, id: number, deliveryDeadline: Date): Promise<void> {
        await this._orderDriver.setOrderDeliveryDeadline(supplierAddress, id, deliveryDeadline);
    }

    async getOrderInfo(supplierAddress: string, id: number, blockNumber?: number): Promise<Order> {
        return this._orderDriver.getOrderInfo(supplierAddress, id, blockNumber);
    }

    async isSupplierOrCustomer(supplierAddress: string, id: number, senderAddress: string): Promise<boolean> {
        return this._orderDriver.isSupplierOrCustomer(supplierAddress, id, senderAddress);
    }

    async orderExists(supplierAddress: string, id: number): Promise<boolean> {
        return this._orderDriver.orderExists(supplierAddress, id);
    }

    async getNegotiationStatus(supplierAddress: string, id: number): Promise<NegotiationStatus> {
        return this._orderDriver.getNegotiationStatus(supplierAddress, id);
    }

    async confirmOrder(supplierAddress: string, id: number): Promise<void> {
        await this._orderDriver.confirmOrder(supplierAddress, id);
    }

    async addDocument(supplierAddress: string, orderId: number, orderStatus: string, documentName: string, documentType: string, documentExternalUrl: string): Promise<void> {
        await this._orderDriver.addDocument(supplierAddress, orderId, orderStatus, documentName, documentType, documentExternalUrl);
    }

    async getOrderLine(supplierAddress: string, orderId: number, orderLineId: number, blockNumber?: number): Promise<OrderLine> {
        return this._orderDriver.getOrderLine(supplierAddress, orderId, orderLineId, blockNumber);
    }

    async updateOrderLine(supplierAddress: string, orderId: number, orderLineId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        return this._orderDriver.updateOrderLine(supplierAddress, orderId, orderLineId, productCategory, quantity, price);
    }

    async addOrderLine(supplierAddress: string, orderId: number, productCategory: string, quantity: number, price: OrderLinePrice): Promise<void> {
        return this._orderDriver.addOrderLine(supplierAddress, orderId, productCategory, quantity, price);
    }

    async getOrders(supplierAddress: string): Promise<Order[]> {
        const orders: Order[] = [];
        const orderCounter = await this.getOrderCounter(supplierAddress);
        for (let i = 1; i <= orderCounter; i++) {
            orders.push(await this.getOrderInfo(supplierAddress, i));
        }
        return orders;
    }

    async getOrderLines(supplierAddress: string, orderId: number) : Promise<OrderLine[]> {
        const order = await this.getOrderInfo(supplierAddress, orderId);
        return Promise.all(order.lineIds.map(async (lineId) => this.getOrderLine(supplierAddress, orderId, lineId)));
    }

    async getBlockNumbersByOrderId(id: number): Promise<Map<OrderEvents, number[]>> {
        return this._orderDriver.getBlockNumbersByOrderId(id);
    }

    async addAdmin(address: string): Promise<void> {
        await this._orderDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._orderDriver.removeAdmin(address);
    }
}

export default OrderService;
