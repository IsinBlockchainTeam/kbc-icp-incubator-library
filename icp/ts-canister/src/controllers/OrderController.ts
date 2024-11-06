import { IDL, query, update } from "azle";
import { IDLOrder, IDLOrderLineRaw } from "../models/idls";
import { Order, OrderLineRaw } from "../models/types";
import {
    AtLeastEditor,
    AtLeastSigner,
    AtLeastViewer,
} from "../decorators/roles";
import OrderService from "../services/OrderService";
import { OnlyContractParty } from "../decorators/parties";

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

    @update(
        [
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Nat,
            IDL.Nat,
            IDL.Nat,
            IDL.Nat,
            IDL.Text,
            IDL.Text,
            IDL.Nat,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Vec(IDLOrderLineRaw),
        ],
        IDLOrder,
    )
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
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: OrderLineRaw[],
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
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines,
        );
    }

    @update(
        [
            IDL.Nat,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Nat,
            IDL.Nat,
            IDL.Nat,
            IDL.Nat,
            IDL.Text,
            IDL.Text,
            IDL.Nat,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Text,
            IDL.Vec(IDLOrderLineRaw),
        ],
        IDLOrder,
    )
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
        incoterms: string,
        shipper: string,
        shippingPort: string,
        deliveryPort: string,
        lines: OrderLineRaw[],
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
            incoterms,
            shipper,
            shippingPort,
            deliveryPort,
            lines,
        );
    }

    @update([IDL.Nat], IDLOrder)
    @AtLeastSigner
    @OnlyContractParty(OrderService.instance)
    async signOrder(id: bigint): Promise<Order> {
        return OrderService.instance.signOrder(id);
    }

    @update([IDL.Nat], IDL.Bool)
    @AtLeastEditor
    async deleteOrder(id: bigint): Promise<boolean> {
        return OrderService.instance.deleteOrder(id);
    }
}
export default OrderController;
