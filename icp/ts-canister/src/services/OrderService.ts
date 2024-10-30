import {StableBTreeMap} from "azle";
import {
    Order, OrderLine,
    ROLES
} from "../models/types";
import {StableMemoryId} from "../utils/stableMemory";
import {validateAddress, validateDeadline, validateInterestedParty, validatePositiveNumber} from "../utils/validation";
import AuthenticationService from "./AuthenticationService";

class OrderService implements HasInterestedParties{
    private static _instance: OrderService;
    private _orders = StableBTreeMap<bigint, Order>(StableMemoryId.ORDERS);

    private constructor() {}
    static get instance() {
        if (!OrderService._instance) {
            OrderService._instance = new OrderService();
        }
        return OrderService._instance;
    }

    getInterestedParties(entityId: bigint): string[] {
        const result = this.getOrder(entityId);
        return [result.supplier, result.customer, result.commissioner];
    }

    getOrders(): Order[] {
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        return this._orders.values().filter(order => {
            const interestedParties = [order.supplier, order.customer, order.commissioner];
            return interestedParties.includes(delegatorAddress);
        });
    }

    getOrder(id: bigint): Order {
        const result = this._orders.get(id);
        if(!result)
            throw new Error('Order not found');
        return result;
    }

    createOrder(
        supplier: string,
        customer: string,
        commissioner: string,
        paymentDeadline: bigint,
        documentDeliveryDeadline: bigint,
        shippingDeadline: bigint,
        deliveryDeadline: bigint,
        arbiter: string,
        token: string,
        agreedAmount: bigint,
        escrowManager: string,
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: OrderLine[]
    ): Order {
        if(supplier === customer)
            throw new Error('Supplier and customer must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Customer', customer);
        validateAddress('Commissioner', commissioner);
        const interestedParties = [supplier, customer, commissioner];
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const role = AuthenticationService.instance.getRole();
        validateInterestedParty('Caller', delegatorAddress, interestedParties);
        validateDeadline('Payment deadline', Number(paymentDeadline));
        validateDeadline('Document delivery deadline', Number(documentDeliveryDeadline));
        validateDeadline('Shipping deadline', Number(shippingDeadline));
        validateDeadline('Delivery deadline', Number(deliveryDeadline));
        validateAddress('Arbiter', arbiter);
        validateAddress('Token', token);
        validatePositiveNumber('Agreed amount', Number(agreedAmount));
        validateAddress('Escrow manager', escrowManager);
        for (const line of lines) {
            // TODO: check that product category exists
            validatePositiveNumber('Quantity', line.quantity);
            validatePositiveNumber('Price amount', line.price.amount);
        }
        const id = this._orders.keys().length;
        const signatures = role === ROLES.SIGNER ? [delegatorAddress] : [];
        const order: Order = {
            id: BigInt(id),
            supplier,
            customer,
            commissioner,
            status: { PENDING: null },
            signatures,
            paymentDeadline,
            documentDeliveryDeadline,
            shippingDeadline,
            deliveryDeadline,
            arbiter,
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines,
            token,
            agreedAmount,
            escrowManager,
            escrow: [],
            shipmentId: []
        };
        this._orders.insert(BigInt(id), order);
        return order;
    }

    updateOrder(
        id: bigint,
        supplier: string,
        customer: string,
        commissioner: string,
        paymentDeadline: bigint,
        documentDeliveryDeadline: bigint,
        shippingDeadline: bigint,
        deliveryDeadline: bigint,
        arbiter: string,
        token: string,
        agreedAmount: bigint,
        escrowManager: string,
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: OrderLine[]
    ): Order {
        const order = this.getOrder(id);
        if(order.supplier == supplier &&
            order.customer == customer &&
            order.commissioner == commissioner &&
            order.paymentDeadline == paymentDeadline &&
            order.documentDeliveryDeadline == documentDeliveryDeadline &&
            order.shippingDeadline == shippingDeadline &&
            order.deliveryDeadline == deliveryDeadline &&
            order.arbiter == arbiter &&
            order.token == token &&
            order.agreedAmount == agreedAmount &&
            order.escrowManager == escrowManager &&
            order.incoterms == incoterms &&
            order.shipper == shipper &&
            order.shippingPort == shippingPort &&
            order.deliveryPort == deliveryPort &&
            order.lines == lines
        ) {
            throw new Error('No changes detected');
        }
        if(supplier === customer)
            throw new Error('Supplier and customer must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Customer', customer);
        validateAddress('Commissioner', commissioner);
        const interestedParties = [supplier, customer, commissioner];
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const role = AuthenticationService.instance.getRole();
        validateInterestedParty('Caller', delegatorAddress, interestedParties);
        validateDeadline('Payment deadline', Number(paymentDeadline));
        validateDeadline('Document delivery deadline', Number(documentDeliveryDeadline));
        validateDeadline('Shipping deadline', Number(shippingDeadline));
        validateDeadline('Delivery deadline', Number(deliveryDeadline));
        validateAddress('Arbiter', arbiter);
        validateAddress('Token', token);
        validatePositiveNumber('Agreed amount', Number(agreedAmount));
        validateAddress('Escrow manager', escrowManager);
        for (const line of lines) {
            // TODO: check that product category exists
            validatePositiveNumber('Quantity', line.quantity);
            validatePositiveNumber('Price amount', line.price.amount);
        }
        const signatures = role === ROLES.SIGNER ? [delegatorAddress] : [];
        const updatedOrder: Order = {
            id: BigInt(id),
            supplier,
            customer,
            commissioner,
            status: { PENDING: null },
            signatures,
            paymentDeadline,
            documentDeliveryDeadline,
            shippingDeadline,
            deliveryDeadline,
            arbiter,
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines: lines,
            token,
            agreedAmount,
            escrowManager,
            escrow: [],
            shipmentId: []
        };
        this._orders.insert(id, updatedOrder);
        return updatedOrder;
    }

    async signOrder(id: bigint): Promise<Order> {
        const order = this.getOrder(id);
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        if(order.signatures.includes(delegatorAddress))
            throw new Error('Order already signed');
        order.signatures.push(delegatorAddress);
        if (order.signatures.includes(order.supplier) && order.signatures.includes(order.customer)) {
            order.status = { CONFIRMED: null };
            // const shipment = await ShipmentService.instance.createShipment(order.supplier, order.commissioner, true);
            // order.shipmentId = [shipment.id];
            // console.log(shipment);
        }
        this._orders.insert(id, order);
        return order;
    }
}
export default OrderService;
