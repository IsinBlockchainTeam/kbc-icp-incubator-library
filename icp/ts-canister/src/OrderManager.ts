import {IDL, StableBTreeMap, update} from 'azle';
import {Order, OrderLine} from "./models/Order";
import {validateAddress, validateDeadline, validateInterestedParty, validatePositiveNumber} from "./utils/validation";
import {RoleProof} from "./models/Proof";
import {OnlyEditor, OnlySigner, OnlyViewer} from "./decorators/roles";
import {ROLES} from "./models/Role";
import {ethers} from "ethers";
import escrowManagerAbi from "../eth-abi/EscrowManager.json";
import {ic} from "azle/experimental";
import {ethSendContractTransaction} from "./utils/rpc";
import {ecdsaPublicKey} from "./utils/ecdsa";
import {getEvmEscrowManagerAddress, getSiweProviderCanisterId} from "./utils/env";

class OrderManager {
    siweProviderCanisterId: string = getSiweProviderCanisterId();
    escrowManagerAddress: string = getEvmEscrowManagerAddress();
    orders = StableBTreeMap<bigint, Order>(0);

    @update([RoleProof], IDL.Vec(Order))
    @OnlyViewer
    async getOrders(roleProof: RoleProof): Promise<Order[]> {
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        return this.orders.values().filter(order => {
            const interestedParties = [order.supplier, order.customer, order.commissioner];
            return interestedParties.includes(companyAddress);
        });
    }

    @update([RoleProof, IDL.Nat], Order)
    @OnlyViewer
    async getOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        const result = this.orders.get(id);
        if(result) {
            const interestedParties = [result.supplier, result.customer, result.commissioner];
            const companyAddress = roleProof.membershipProof.delegatorAddress;
            if(!interestedParties.includes(companyAddress))
                throw new Error('Access denied');
            return result;
        }
        throw new Error('Order not found');
    }

    @update([RoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(OrderLine)], Order)
    @OnlyEditor
    async createOrder(
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
    ): Promise<Order> {
        if(supplier === customer)
            throw new Error('Supplier and customer must be different');
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
        const id = this.orders.keys().length;
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
        this.orders.insert(BigInt(id), order);
        return order;
    }

    @update([RoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(OrderLine)], Order)
    @OnlyEditor
    async updateOrder(
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
    ): Promise<Order> {
        const order = this.orders.get(id);
        if (!order)
            throw new Error('Order not found');
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
            lines: lines,
            token,
            agreedAmount,
            escrowManager,
            escrow: [],
            shipmentId: []
        };
        this.orders.insert(id, updatedOrder);
        return updatedOrder;
    }

    @update([RoleProof, IDL.Nat], Order)
    @OnlySigner
    async signOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        const order = this.orders.get(id);
        if (!order)
            throw new Error('Order not found');
        const companyAddress = roleProof.membershipProof.delegatorAddress;
        if(order.signatures.includes(companyAddress))
            throw new Error('Order already signed');
        order.signatures.push(companyAddress);
        if (order.signatures.includes(order.supplier) && order.signatures.includes(order.customer))
            order.status = { CONFIRMED: null };
        this.orders.insert(id, order);
        return order;
    }

    @update([IDL.Text, IDL.Nat, IDL.Text])
    async registerDownPayment(supplier: string, paymentDeadline: number, token: string): Promise<void> {
        const canisterAddress = ethers.computeAddress(
            ethers.hexlify(
                await ecdsaPublicKey([ic.id().toUint8Array()])
            )
        );
        console.log('canisterAddress', canisterAddress);
        const resp = await ethSendContractTransaction(
            this.escrowManagerAddress,
            escrowManagerAbi.abi,
            'registerEscrow',
            [canisterAddress, supplier, paymentDeadline, token]
        );
        console.log(resp);
    }
}
export default OrderManager;
