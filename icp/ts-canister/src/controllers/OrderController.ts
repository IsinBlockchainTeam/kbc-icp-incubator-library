import {IDL, update} from "azle";
import {RoleProof} from "../models/Proof";
import {Order, OrderLine} from "../models/Order";
import {OnlyEditor, OnlySigner, OnlyViewer} from "../decorators/roles";
import OrderService from "../services/OrderService";

class OrderController {
    @update([RoleProof], IDL.Vec(Order))
    @OnlyViewer
    async getOrders(roleProof: RoleProof): Promise<Order[]> {
        return OrderService.instance.getOrders(roleProof);
    }

    @update([RoleProof, IDL.Nat], Order)
    @OnlyViewer
    async getOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        return OrderService.instance.getOrder(roleProof, id);
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

    @update([RoleProof, IDL.Nat], Order)
    @OnlySigner
    async signOrder(roleProof: RoleProof, id: bigint): Promise<Order> {
        return OrderService.instance.signOrder(roleProof, id);
    }
}
export default OrderController;
