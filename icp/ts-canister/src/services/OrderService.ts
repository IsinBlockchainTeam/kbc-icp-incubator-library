import { StableBTreeMap } from 'azle';
import { Order, OrderLine, RoleProof, ROLES } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import { validateAddress, validateDeadline, validateInterestedParty, validatePositiveNumber } from '../utils/validation';
import ShipmentService from './ShipmentService';

class OrderService {
    private static _instance: OrderService;

    private _orders = StableBTreeMap<bigint, Order>(StableMemoryId.ORDERS);

    static get instance() {
        if (!OrderService._instance) {
            OrderService._instance = new OrderService();
        }
        return OrderService._instance;
    }

    getOrders(roleProof: RoleProof): Order[] {
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        return this._orders.values().filter((order) => {
            const interestedParties = [order.supplier, order.customer, order.commissioner];
            return interestedParties.includes(companyAddress);
        });
    }

    getOrder(roleProof: RoleProof, id: bigint): Order {
        const result = this._orders.get(id);
        if (result) {
            const interestedParties = [result.supplier, result.customer, result.commissioner];
            const companyAddress = roleProof.membershipProof.delegatorAddress;
            if (!interestedParties.includes(companyAddress)) throw new Error('Access denied');
            return result;
        }
        throw new Error('Order not found');
    }

    createOrder(
        roleProof: RoleProof,
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
        if (supplier === customer) throw new Error('Supplier and customer must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Customer', customer);
        validateAddress('Commissioner', commissioner);
        const interestedParties = [supplier, customer, commissioner];
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        validateInterestedParty('Caller', companyAddress, interestedParties);
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
        const signatures = roleProof.role === ROLES.SIGNER ? [companyAddress] : [];
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
        roleProof: RoleProof,
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
        const order = this._orders.get(id);
        if (!order) throw new Error('Order not found');
        if (
            order.supplier === supplier &&
            order.customer === customer &&
            order.commissioner === commissioner &&
            order.paymentDeadline === paymentDeadline &&
            order.documentDeliveryDeadline === documentDeliveryDeadline &&
            order.shippingDeadline === shippingDeadline &&
            order.deliveryDeadline === deliveryDeadline &&
            order.arbiter === arbiter &&
            order.token === token &&
            order.agreedAmount === agreedAmount &&
            order.escrowManager === escrowManager &&
            order.incoterms === incoterms &&
            order.shipper === shipper &&
            order.shippingPort === shippingPort &&
            order.deliveryPort === deliveryPort &&
            order.lines === lines
        ) {
            throw new Error('No changes detected');
        }
        if (supplier === customer) throw new Error('Supplier and customer must be different');
        validateAddress('Supplier', supplier);
        validateAddress('Customer', customer);
        validateAddress('Commissioner', commissioner);
        const interestedParties = [supplier, customer, commissioner];
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        validateInterestedParty('Caller', companyAddress, interestedParties);
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
        const signatures = roleProof.role === ROLES.SIGNER ? [companyAddress] : [];
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
            lines,
            token,
            agreedAmount,
            escrowManager,
            escrow: [],
            shipmentId: []
        };
        this._orders.insert(id, updatedOrder);
        return updatedOrder;
    }

    async signOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        const order = this._orders.get(id);
        if (!order) throw new Error('Order not found');
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        if (order.signatures.includes(companyAddress)) throw new Error('Order already signed');
        order.signatures.push(companyAddress);
        if (order.signatures.includes(order.supplier) && order.signatures.includes(order.customer)) {
            order.status = { CONFIRMED: null };
            const shipment = await ShipmentService.instance.createShipment(roleProof, order.supplier, order.commissioner, true);
            order.shipmentId = [shipment.id];
            console.log(shipment);
        }
        this._orders.insert(id, order);
        return order;
    }
}
export default OrderService;
