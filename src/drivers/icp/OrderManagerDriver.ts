import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../../icp/ts-canister/.dfx/local/canisters/order_manager/service.did';
import {createActor} from "../../declarations/order_manager";
import {RoleProof} from "../../../icp/ts-canister/src/models/Proof";
import {EntityBuilder} from "../../utils/icp/EntityBuilder";
import {Order} from "../../entities/icp/Order";

export type OrderParams = {
    supplier: string;
    customer: string;
    commissioner: string;
    paymentDeadline: Date;
    documentDeliveryDeadline: Date;
    shippingDeadline: Date;
    deliveryDeadline: Date;
    arbiter: string;
    token: string;
    agreedAmount: number;
    escrowManager: string;
    incoterms: string;
    shipper: string;
    shippingPort: string;
    deliveryPort: string;
    lines: {
        productCategoryId: number;
        quantity: number;
        unit: string;
        price: {
            amount: number;
            fiat: string;
        };
    }[];
};

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

    async getOrders(roleProof: RoleProof): Promise<Order[]> {
        const resp = await this._actor.getOrders(roleProof);
        return resp.map(rawOrder => EntityBuilder.buildOrder(rawOrder));
    }

    async getOrder(roleProof: RoleProof, id: number): Promise<Order> {
        const resp = await this._actor.getOrder(roleProof, BigInt(id));
        return EntityBuilder.buildOrder(resp);
    }

    async createOrder(roleProof: RoleProof, params: OrderParams): Promise<Order> {
        const resp = await this._actor.createOrder(
            roleProof,
            params.supplier,
            params.customer,
            params.commissioner,
            BigInt(Math.floor(params.paymentDeadline.getTime() / 1000)),
            BigInt(Math.floor(params.documentDeliveryDeadline.getTime() / 1000)),
            BigInt(Math.floor(params.shippingDeadline.getTime() / 1000)),
            BigInt(Math.floor(params.deliveryDeadline.getTime() / 1000)),
            params.arbiter,
            params.token,
            BigInt(params.agreedAmount),
            params.escrowManager,
            params.incoterms,
            params.shipper,
            params.shippingPort,
            params.deliveryPort,
            params.lines.map(line => ({
                productCategoryId: BigInt(line.productCategoryId),
                quantity: line.quantity,
                unit: line.unit,
                price: {
                    amount: line.price.amount,
                    fiat: line.price.fiat
                }
            }))
        );
        return EntityBuilder.buildOrder(resp);
    }

    async updateOrder(roleProof: RoleProof, id: number, params: OrderParams): Promise<Order> {
        const resp = await this._actor.updateOrder(
            roleProof,
            BigInt(id),
            params.supplier,
            params.customer,
            params.commissioner,
            BigInt(Math.floor(params.paymentDeadline.getTime() / 1000)),
            BigInt(Math.floor(params.documentDeliveryDeadline.getTime() / 1000)),
            BigInt(Math.floor(params.shippingDeadline.getTime() / 1000)),
            BigInt(Math.floor(params.deliveryDeadline.getTime() / 1000)),
            params.arbiter,
            params.token,
            BigInt(params.agreedAmount),
            params.escrowManager,
            params.incoterms,
            params.shipper,
            params.shippingPort,
            params.deliveryPort,
            params.lines.map(line => ({
                productCategoryId: BigInt(line.productCategoryId),
                quantity: line.quantity,
                unit: line.unit,
                price: {
                    amount: line.price.amount,
                    fiat: line.price.fiat
                }
            }))
        );
        return EntityBuilder.buildOrder(resp);
    }

    async signOrder(roleProof: RoleProof, id: number): Promise<Order> {
        const resp = await this._actor.signOrder(roleProof, BigInt(id));
        return EntityBuilder.buildOrder(resp);
    }
}
