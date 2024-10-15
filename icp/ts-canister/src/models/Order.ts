import {Price} from "./Price";
import {IDL} from "azle";

export const OrderStatus = IDL.Variant({
    PENDING: IDL.Null,
    CONFIRMED: IDL.Null,
    EXPIRED: IDL.Null,
});
export type OrderStatus = { PENDING: null } | { CONFIRMED: null } | { EXPIRED: null };
export type OrderLine = {
    productCategoryId: bigint;
    quantity: number;
    unit: string;
    price: Price;
    // materialId: bigint | null;
}
export const OrderLine = IDL.Record({
    productCategoryId: IDL.Nat,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: Price,
    // materialId: IDL.Opt(IDL.Nat),
});
export type Order = {
    id: bigint;
    supplier: string;
    customer: string;
    commissioner: string;
    signatures: string[];
    status: OrderStatus;
    paymentDeadline: bigint;
    documentDeliveryDeadline: bigint;
    shippingDeadline: bigint;
    deliveryDeadline: bigint;
    arbiter: string;
    incoterms: string;
    shipper: string;
    shippingPort: string;
    deliveryPort: string;
    lines: OrderLine[];
    token: string;
    agreedAmount: bigint;
    escrowManager: string;
    escrow: [string] | [];
    shipmentId: [bigint] | [];
}
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
