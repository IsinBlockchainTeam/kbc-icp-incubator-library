import { StableBTreeMap } from 'azle';
import {Order, ROLES, OrderLineRaw, OrderStatusEnum, OrderLine} from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import { validateAddress, validateDeadline, validateInterestedParty, validatePositiveNumber } from '../utils/validation';
import AuthenticationService from './AuthenticationService';
import ShipmentService from './ShipmentService';
import {
    NotAuthorizedError,
    OrderAlreadyConfirmedError,
    OrderAlreadySignedError,
    OrderNotFoundError,
    OrderWithNoChangesError,
    SameActorsError
} from '../models/errors';
import { HasInterestedParties } from './interfaces/HasInterestedParties';
import {HasSupplier} from "./interfaces/HasSupplier";
import {HasCommissioner} from "./interfaces/HasCommissioner";
import MaterialService from "./MaterialService";
import {MaterialNotValid} from "../models/errors/MaterialError";

class OrderService implements HasInterestedParties, HasSupplier, HasCommissioner {
    private static _instance: OrderService;

    private _orders = StableBTreeMap<bigint, Order>(StableMemoryId.ORDERS);

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

    getSupplier(entityId: bigint): string {
        return this.getOrder(entityId).supplier;
    }

    getCommissioner(entityId: bigint): string {
        return this.getOrder(entityId).commissioner;
    }

    getOrders(): Order[] {
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        return this._orders.values().filter((order) => {
            const interestedParties = [order.supplier, order.customer, order.commissioner];
            return interestedParties.includes(delegatorAddress);
        });
    }

    getOrdersBetweenParties(supplier: string, customer: string): Order[] {
        return this._orders.values().filter((order) => {
            const interestedParties = [order.supplier, order.customer, order.commissioner];
            return interestedParties.includes(supplier) && interestedParties.includes(customer);
        });
    }

    getOrder(id: bigint): Order {
        const result = this._orders.get(id);
        if (!result) throw new OrderNotFoundError();
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
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: OrderLineRaw[]
    ): Order {
        if (supplier === customer) throw new SameActorsError();
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
        validateAddress('Token', token);
        validatePositiveNumber('Agreed amount', Number(agreedAmount));
        const orderLines = [];
        for (const line of lines) {
            const supplierMaterial = MaterialService.instance.getMaterial(line.supplierMaterialId);
            if(supplierMaterial.owner !== supplier) throw new MaterialNotValid();
            if(supplierMaterial.isInput) throw new MaterialNotValid();
            const commissionerMaterial = MaterialService.instance.getMaterial(line.commissionerMaterialId);
            if(commissionerMaterial.owner !== commissioner) throw new NotAuthorizedError();
            if(!commissionerMaterial.isInput) throw new MaterialNotValid();
            validatePositiveNumber('Quantity', line.quantity);
            validatePositiveNumber('Price amount', line.price.amount);
            const orderLine: OrderLine = {
                supplierMaterial,
                commissionerMaterial,
                quantity: line.quantity,
                unit: line.unit,
                price: line.price
            }
            orderLines.push(orderLine);
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
            lines: orderLines,
            token,
            agreedAmount,
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
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: OrderLineRaw[]
    ): Order {
        const order = this.getOrder(id);
        if (OrderStatusEnum.CONFIRMED in order.status) throw new OrderAlreadyConfirmedError();
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
            order.incoterms === incoterms &&
            order.shipper === shipper &&
            order.shippingPort === shippingPort &&
            order.deliveryPort === deliveryPort &&
            // check if the lines are the same
            order.lines
                .map((l) => l.supplierMaterial.id)
                .sort()
                .toString() ===
                lines
                    .map((l) => l.supplierMaterialId)
                    .sort()
                    .toString() &&
            order.lines
                .map((l) => l.commissionerMaterial.id)
                .sort()
                .toString() ===
            lines
                .map((l) => l.commissionerMaterialId)
                .sort()
                .toString() &&
            order.lines
                .map((l) => l.quantity)
                .sort()
                .toString() ===
                lines
                    .map((l) => l.quantity)
                    .sort()
                    .toString() &&
            order.lines
                .map((l) => l.unit)
                .sort()
                .toString() ===
                lines
                    .map((l) => l.unit)
                    .sort()
                    .toString() &&
            order.lines
                .map((l) => l.price.amount)
                .sort()
                .toString() ===
                lines
                    .map((l) => l.price.amount)
                    .sort()
                    .toString() &&
            order.lines
                .map((l) => l.price.fiat)
                .sort()
                .toString() ===
                lines
                    .map((l) => l.price.fiat)
                    .sort()
                    .toString()
        ) {
            throw new OrderWithNoChangesError();
        }
        if (supplier === customer) throw new SameActorsError();
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
        validateAddress('Token', token);
        validatePositiveNumber('Agreed amount', Number(agreedAmount));
        const orderLines = [];
        for (const line of lines) {
            const supplierMaterial = MaterialService.instance.getMaterial(line.supplierMaterialId);
            if(supplierMaterial.owner !== supplier) throw new NotAuthorizedError();
            const commissionerMaterial = MaterialService.instance.getMaterial(line.commissionerMaterialId);
            if(commissionerMaterial.owner !== commissioner) throw new NotAuthorizedError();
            validatePositiveNumber('Quantity', line.quantity);
            validatePositiveNumber('Price amount', line.price.amount);
            orderLines.push({
                supplierMaterial,
                commissionerMaterial,
                quantity: line.quantity,
                unit: line.unit,
                price: line.price
            });
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
            lines: orderLines,
            token,
            agreedAmount,
            shipmentId: []
        };
        this._orders.insert(id, updatedOrder);
        return updatedOrder;
    }

    async signOrder(id: bigint): Promise<Order> {
        const order = this.getOrder(id);
        if (OrderStatusEnum.CONFIRMED in order.status) throw new OrderAlreadyConfirmedError();
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        if (order.signatures.includes(delegatorAddress)) throw new OrderAlreadySignedError();
        order.signatures.push(delegatorAddress);
        if (order.signatures.includes(order.supplier) && order.signatures.includes(order.customer)) {
            order.status = { CONFIRMED: null };
            const duration = order.paymentDeadline - BigInt(Math.trunc(Date.now() / 1000));
            const shipment = await ShipmentService.instance.createShipment(order.supplier, order.commissioner, true, duration, order.token);
            order.shipmentId = [shipment.id];
        }
        this._orders.insert(id, order);
        return order;
    }

    async deleteOrder(id: bigint): Promise<boolean> {
        const order = this.getOrder(id);
        if (OrderStatusEnum.CONFIRMED in order.status) {
            throw new Error('Order already confirmed');
        }

        this._orders.remove(id);

        return true;
    }
}
export default OrderService;
