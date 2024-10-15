import {
    Order as ICPOrder,
    OrderStatus as ICPOrderStatus,
} from '../../../icp/ts-canister/src/models/Order';
import {Order, OrderStatus} from "../../entities/icp/Order";

export class EntityBuilder {
    static buildOrder(order: ICPOrder) {
        return new Order(
            Number(order.id),
            order.supplier,
            order.customer,
            order.commissioner,
            order.signatures,
            this._buildOrderStatus(order.status),
            new Date(Number(order.paymentDeadline) * 1000),
            new Date(Number(order.documentDeliveryDeadline) * 1000),
            new Date(Number(order.shippingDeadline) * 1000),
            new Date(Number(order.deliveryDeadline) * 1000),
            order.arbiter,
            order.incoterms,
            order.shipper,
            order.shippingPort,
            order.deliveryPort,
            order.lines.map(line => ({
                productCategoryId: Number(line.productCategoryId),
                quantity: Number(line.quantity),
                unit: line.unit,
                price: {
                    amount: Number(line.price.amount),
                    fiat: line.price.fiat
                }
            })),
            order.token,
            Number(order.agreedAmount),
            // TODO check if this is correct
            order.shipmentId[0] ? Number(order.shipmentId[0]) : -1,
        );
    }

    static _buildOrderStatus(orderStatus: ICPOrderStatus): OrderStatus {
        if (OrderStatus.PENDING in orderStatus)
            return OrderStatus.PENDING;
        if (OrderStatus.CONFIRMED in orderStatus)
            return OrderStatus.CONFIRMED;
        if (OrderStatus.EXPIRED in orderStatus)
            return OrderStatus.EXPIRED;
        throw new Error('Invalid document type');
    }
}
