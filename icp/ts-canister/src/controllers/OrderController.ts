import {IDL, query, update} from "azle";
import {
    IDLOrder,
    IDLOrderLine
} from "../models/idls";
import {
    Order,
    OrderLine
} from "../models/types";
import {AtLeastEditor, AtLeastSigner, AtLeastViewer} from "../decorators/roles";
import OrderService from "../services/OrderService";
import {OnlyContractParty} from "../decorators/parties";

class OrderController {
    @query([], IDL.Vec(IDLOrder))
    @AtLeastViewer
    async getOrders(): Promise<Order[]> {
        return OrderService.instance.getOrders();
    }

    @query([IDL.Nat], IDLOrder)
    @AtLeastViewer
    @OnlyContractParty(OrderService.instance)
    async getOrder(id: bigint): Promise<Order> {
        return OrderService.instance.getOrder(id);
    }

    @update([IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDLOrderLine)], IDLOrder)
    @AtLeastEditor
    async createOrder(
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

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Text, IDL.Vec(IDLOrderLine)], IDLOrder)
    @AtLeastEditor
    @OnlyContractParty(OrderService.instance)
    async updateOrder(
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

    @update([IDL.Nat], IDLOrder)
    @AtLeastSigner
    @OnlyContractParty(OrderService.instance)
    async signOrder(id: bigint): Promise<Order> {
        return OrderService.instance.signOrder(id);
    }
}
export default OrderController;
