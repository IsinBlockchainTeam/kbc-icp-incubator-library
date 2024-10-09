import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../../icp/ts-canister/.dfx/local/canisters/order_manager/service.did';
import {createActor} from "../../declarations/order_manager";
import {RoleProof} from "../../../icp/ts-canister/src/models/Proof";

export class OrderManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getOrders(roleProof: RoleProof) {
        return this._actor.getOrders(roleProof);
    }

    async getOrder(roleProof: RoleProof, id: number) {
        return this._actor.getOrder(roleProof, BigInt(id));
    }

    async createOrder(
        roleProof: RoleProof,
        supplier: string,
        customer: string,
        commissioner: string,
        paymentDeadline: Date,
        documentDeliveryDeadline: Date,
        shippingDeadline: Date,
        deliveryDeadline: Date,
        arbiter: string,
        token: string,
        agreedAmount: number,
        escrowManager: string,
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: {
            productCategoryId: number,
            quantity: number,
            unit: string,
            price: {
                amount: number,
                fiat: string
            }
        }[]
    ) {
        return this._actor.createOrder(
            roleProof,
            supplier,
            customer,
            commissioner,
            BigInt(Math.floor(paymentDeadline.getTime() / 1000)),
            BigInt(Math.floor(documentDeliveryDeadline.getTime() / 1000)),
            BigInt(Math.floor(shippingDeadline.getTime() / 1000)),
            BigInt(Math.floor(deliveryDeadline.getTime() / 1000)),
            arbiter,
            token,
            BigInt(agreedAmount),
            escrowManager,
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines.map(line => ({
                productCategoryId: BigInt(line.productCategoryId),
                quantity: line.quantity,
                unit: line.unit,
                price: {
                    amount: line.price.amount,
                    fiat: line.price.fiat
                }
            }))
        );
    }

    async updateOrder(
        roleProof: RoleProof,
        id: number,
        supplier: string,
        customer: string,
        commissioner: string,
        paymentDeadline: Date,
        documentDeliveryDeadline: Date,
        shippingDeadline: Date,
        deliveryDeadline: Date,
        arbiter: string,
        token: string,
        agreedAmount: number,
        escrowManager: string,
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: {
            productCategoryId: number,
            quantity: number,
            unit: string,
            price: {
                amount: number,
                fiat: string
            }
        }[]
    ) {
        return this._actor.updateOrder(
            roleProof,
            BigInt(id),
            supplier,
            customer,
            commissioner,
            BigInt(Math.floor(paymentDeadline.getTime() / 1000)),
            BigInt(Math.floor(documentDeliveryDeadline.getTime() / 1000)),
            BigInt(Math.floor(shippingDeadline.getTime() / 1000)),
            BigInt(Math.floor(deliveryDeadline.getTime() / 1000)),
            arbiter,
            token,
            BigInt(agreedAmount),
            escrowManager,
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines.map(line => ({
                productCategoryId: BigInt(line.productCategoryId),
                quantity: line.quantity,
                unit: line.unit,
                price: {
                    amount: line.price.amount,
                    fiat: line.price.fiat
                }
            }))
        );
    }

    async signOrder(roleProof: RoleProof, id: number) {
        return this._actor.signOrder(roleProof, BigInt(id));
    }
}
