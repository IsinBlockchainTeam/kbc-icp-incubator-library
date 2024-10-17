import {IDL, update} from "azle";
import {
    RoleProof as IDLRoleProof,
    Order as IDLOrder, OrderLine as IDLOrderLine
} from "../models/idls";
import {
    RoleProof,
    Order, OrderLine
} from "../models/types";
import {OnlyEditor, OnlySigner, OnlyViewer} from "../decorators/roles";
import OrderService from "../services/OrderService";

class OrderController {
    @update([IDLRoleProof], IDL.Vec(IDLOrder))
    @OnlyViewer
    async getOrders(roleProof: RoleProof): Promise<Order[]> {
        return OrderService.instance.getOrders(roleProof);
    }

    @update([IDLRoleProof, IDL.Nat], IDLOrder)
    @OnlyViewer
    async getOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        return OrderService.instance.getOrder(roleProof, id);
    }

    @update([IDLRoleProof, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDLOrderLine)], IDLOrder)
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
        return OrderService.instance.createOrder(
            roleProof,
            supplier,
            customer,
            commissioner,
            paymentDeadline,
            documentDeliveryDeadline,
            shippingDeadline,
            deliveryDeadline,
            arbiter,
            token,
            agreedAmount,
            escrowManager,
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines
        );
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDLOrderLine)], IDLOrder)
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
        return OrderService.instance.updateOrder(
            roleProof,
            id,
            supplier,
            customer,
            commissioner,
            paymentDeadline,
            documentDeliveryDeadline,
            shippingDeadline,
            deliveryDeadline,
            arbiter,
            token,
            agreedAmount,
            escrowManager,
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines
        );
    }

    @update([IDLRoleProof, IDL.Nat], IDLOrder)
    @OnlySigner
    async signOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        return OrderService.instance.signOrder(roleProof, id);
    }
}
export default OrderController;
