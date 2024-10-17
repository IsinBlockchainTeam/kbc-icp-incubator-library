import {IDL} from "azle";
import {Price as IDLPrice} from "./Price";

export const OrderStatus = IDL.Variant({
    PENDING: IDL.Null,
    CONFIRMED: IDL.Null,
    EXPIRED: IDL.Null,
});
export const OrderLine = IDL.Record({
    productCategoryId: IDL.Nat,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: IDLPrice,
    // materialId: IDL.Opt(IDL.Nat),
});
export const Order = IDL.Record({
    id: IDL.Nat,
    supplier: IDL.Text,
    customer: IDL.Text,
    commissioner: IDL.Text,
    signatures: IDL.Vec(IDL.Text),
    status: OrderStatus,
    paymentDeadline: IDL.Nat,
    documentDeliveryDeadline: IDL.Nat,
    shippingDeadline: IDL.Nat,
    deliveryDeadline: IDL.Nat,
    arbiter: IDL.Text,
    incoterms: IDL.Text,
    shipper: IDL.Text,
    shippingPort: IDL.Text,
    deliveryPort: IDL.Text,
    lines: IDL.Vec(OrderLine),
    token: IDL.Text,
    agreedAmount: IDL.Nat,
    escrowManager: IDL.Text,
    escrow: IDL.Opt(IDL.Text),
    shipmentId: IDL.Opt(IDL.Nat),
});
