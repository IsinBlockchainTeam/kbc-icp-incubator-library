import {IDL, update, init, StableBTreeMap, call} from 'azle';
import {Order, OrderLine} from "./models/Order";
import {Address, GetAddressResponse} from "./models/Address";
import {validateAddress, validateDeadline, validateInterestedParty, validatePositiveNumber} from "./validation";
import {RoleProof} from "./models/Proof";
import {OnlyEditor, OnlySigner, OnlyViewer} from "./decorators/roles";
import {ROLES} from "./models/Role";
import {ethers} from "ethers";
import escrowManagerAbi from "../eth-abi/EscrowManager.json";
import {ic, Principal} from "azle/experimental";
import {
    CHAIN_ID,
    ESCROW_MANAGER_ADDRESS,
    ethFeeHistory,
    ethGetTransactionCount,
    ethMaxPriorityFeePerGas,
    ethSendRawTransaction,
    RPC_URL
} from "./rpcUtils";
import {calculateRsvForTEcdsa, ecdsaPublicKey, signWithEcdsa} from "./ecdsaUtils";

const RPC_URL_KEY = "RPC_URL";
const ESCROW_MANAGER_ADDRESS_KEY = "ESCROW_MANAGER_ADDRESS";
class OrderManager {
    instanceVariable = StableBTreeMap<string, string>(0);
    siweProviderCanisterId: string = getSiweProviderCanisterId();
    orders = StableBTreeMap<bigint, Order>(0);

    @init([])
    async init(): Promise<void> {
        this.instanceVariable.insert(RPC_URL_KEY, RPC_URL);
        this.instanceVariable.insert(ESCROW_MANAGER_ADDRESS_KEY, ESCROW_MANAGER_ADDRESS);
    }

    @update([RoleProof], IDL.Vec(Order))
    @OnlyViewer
    async getOrders(roleProof: RoleProof,): Promise<Order[]> {
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
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
            const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
            if(!interestedParties.includes(companyAddress))
                throw new Error('Access denied');
            return result;
        }
        throw new Error('Order not found');
    }

    @update([RoleProof, Address, Address, Address, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, Address, Address, IDL.Nat, Address, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(OrderLine)], Order)
    @OnlyEditor
    async createOrder(
        roleProof: RoleProof,
        supplier: Address,
        customer: Address,
        commissioner: Address,
        paymentDeadline: number,
        documentDeliveryDeadline: number,
        shippingDeadline: number,
        deliveryDeadline: number,
        arbiter: Address,
        token: Address,
        agreedAmount: number,
        escrowManager: Address,
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
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        validateInterestedParty('Caller', companyAddress, interestedParties);
        validateDeadline('Payment deadline', paymentDeadline);
        validateDeadline('Document delivery deadline', documentDeliveryDeadline);
        validateDeadline('Shipping deadline', shippingDeadline);
        validateDeadline('Delivery deadline', deliveryDeadline);
        validateAddress('Arbiter', arbiter);
        validateAddress('Token', token);
        validatePositiveNumber('Agreed amount', agreedAmount);
        validateAddress('Escrow manager', escrowManager);
        for (const line of lines) {
            // TODO: check that product category exists
            validatePositiveNumber('Quantity', line.quantity);
            validatePositiveNumber('Price amount', line.price.amount);
        }
        const id = this.orders.keys().length;
        const signatures = roleProof.role === ROLES.SIGNER ? [companyAddress] : [];
        const order: Order = {
            id,
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

    @update([RoleProof, IDL.Nat, Address, Address, Address, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, Address, Address, IDL.Nat, Address, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(OrderLine)], Order)
    @OnlyEditor
    async updateOrder(
        roleProof: RoleProof,
        id: bigint,
        supplier: Address,
        customer: Address,
        commissioner: Address,
        paymentDeadline: number,
        documentDeliveryDeadline: number,
        shippingDeadline: number,
        deliveryDeadline: number,
        arbiter: Address,
        token: Address,
        agreedAmount: number,
        escrowManager: Address,
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
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        validateInterestedParty('Caller', companyAddress, interestedParties);
        validateDeadline('Payment deadline', paymentDeadline);
        validateDeadline('Document delivery deadline', documentDeliveryDeadline);
        validateDeadline('Shipping deadline', shippingDeadline);
        validateDeadline('Delivery deadline', deliveryDeadline);
        validateAddress('Arbiter', arbiter);
        validateAddress('Token', token);
        validatePositiveNumber('Agreed amount', agreedAmount);
        validateAddress('Escrow manager', escrowManager);
        for (const line of lines) {
            // TODO: check that product category exists
            validatePositiveNumber('Quantity', line.quantity);
            validatePositiveNumber('Price amount', line.price.amount);
        }
        const signatures = roleProof.role === ROLES.SIGNER ? [companyAddress] : [];
        const updatedOrder: Order = {
            id: Number(id),
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
        const companyAddress = roleProof.membershipProof.delegatorAddress as Address;
        if(order.signatures.includes(companyAddress))
            throw new Error('Order already signed');
        order.signatures.push(companyAddress);
        if (order.signatures.includes(order.supplier) && order.signatures.includes(order.customer))
            order.status = { CONFIRMED: null };
        this.orders.insert(id, order);
        return order;
    }

    @update([IDL.Text, IDL.Nat, IDL.Text])
    async registerDownPayment(supplier: Address, paymentDeadline: number, token: Address): Promise<void> {
        const methodName = "registerEscrow";
        const canisterAddress = ethers.computeAddress(
            ethers.hexlify(
                await ecdsaPublicKey([ic.id().toUint8Array()])
            )
        );
        console.log('canisterAddress', canisterAddress);
        const abiInterface = new ethers.Interface(escrowManagerAbi.abi);
        const data = abiInterface.encodeFunctionData(methodName, [canisterAddress, supplier, paymentDeadline, token]);
        //TODO: eth_maxPriorityFeePerGas not available in hardhat
        // const maxPriorityFeePerGas = await ethMaxPriorityFeePerGas();
        const maxPriorityFeePerGas = BigInt(1);
        console.log('maxPriorityFeePerGas', maxPriorityFeePerGas);
        //TODO: eth_maxPriorityFeePerGas not available in hardhat
        // const baseFeePerGas = BigInt(
        //     (await ethFeeHistory()).Consistent?.Ok[0].baseFeePerGas[0]
        // );
        const baseFeePerGas = 300_000_000n;
        console.log('baseFeePerGas', baseFeePerGas);
        const maxFeePerGas = baseFeePerGas * 2n + maxPriorityFeePerGas;
        const gasLimit = 30_000_000n; // Potresti voler stimare il gas necessario per la chiamata
        const nonce = await ethGetTransactionCount(canisterAddress);
        console.log('nonce', nonce);
        let tx = ethers.Transaction.from({
            to: this.instanceVariable.get(ESCROW_MANAGER_ADDRESS_KEY),
            data,
            value: 0,
            maxPriorityFeePerGas,
            maxFeePerGas,
            gasLimit,
            nonce,
            chainId: CHAIN_ID
        });
        const unsignedSerializedTx = tx.unsignedSerialized;
        const unsignedSerializedTxHash = ethers.keccak256(unsignedSerializedTx);
        console.log('unsignedSerializedTxHash', unsignedSerializedTxHash);
        const signedSerializedTxHash = await signWithEcdsa(
            [ic.id().toUint8Array()],
            ethers.getBytes(unsignedSerializedTxHash)
        );
        const { r, s, v } = calculateRsvForTEcdsa(
            CHAIN_ID,
            canisterAddress,
            unsignedSerializedTxHash,
            signedSerializedTxHash
        );
        tx.signature = {r, s, v};
        const rawTransaction = tx.serialized;
        const resp = await ethSendRawTransaction(rawTransaction);
        console.log(resp);
    }

    async getAddress(principal: Principal): Promise<Address> {
        const resp = await call(
            this.siweProviderCanisterId,
            'get_address',
            {
                paramIdlTypes: [IDL.Vec(IDL.Nat8)],
                returnIdlType: GetAddressResponse,
                args: [principal.toUint8Array()],
            }
        );
        if(resp.Err) throw new Error('Unable to fetch address');
        return resp.Ok;
    }
}
function getSiweProviderCanisterId(): string {
    if (process.env.CANISTER_ID_IC_SIWE_PROVIDER !== undefined) {
        return process.env.CANISTER_ID_IC_SIWE_PROVIDER;
    }

    throw new Error(`process.env.CANISTER_ID_IC_SIWE_PROVIDER is not defined`);
}
export default OrderManager;
