import type { ActorSubclass, Identity } from '@dfinity/agent';
import {createActor} from "icp-declarations/entity_manager";
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
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

export class OrderDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getOrders(): Promise<Order[]> {
        const resp = await this._actor.getOrders();
        return resp.map(rawOrder => EntityBuilder.buildOrder(rawOrder));
    }

    async getOrder(id: number): Promise<Order> {
        const resp = await this._actor.getOrder(BigInt(id));
        return EntityBuilder.buildOrder(resp);
    }

    async createOrder(params: OrderParams): Promise<Order> {
        const resp = await this._actor.createOrder(
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

    async updateOrder(id: number, params: OrderParams): Promise<Order> {
        const resp = await this._actor.updateOrder(
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

    async signOrder(id: number): Promise<Order> {
        const resp = await this._actor.signOrder(BigInt(id));
        return EntityBuilder.buildOrder(resp);
    }
}
