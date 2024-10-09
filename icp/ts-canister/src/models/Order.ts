import {Price} from "./Price";
import {Address} from "./Address";
import {IDL} from "azle";

export const OrderStatus = IDL.Variant({
    PENDING: IDL.Null,
    CONFIRMED: IDL.Null,
    EXPIRED: IDL.Null,
});
export type OrderStatus = { PENDING: null } | { CONFIRMED: null } | { EXPIRED: null };
export type OrderLine = {
    productCategoryId: number;
    quantity: number;
    unit: string;
    price: Price;
    // materialId: number | null;
}
export const OrderLine = IDL.Record({
    productCategoryId: IDL.Nat,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: Price,
    // materialId: IDL.Opt(IDL.Nat),
});
export type Order = {
    id: number;
    supplier: Address;
    customer: Address;
    commissioner: Address;
    signatures: Address[];
    status: OrderStatus;
    paymentDeadline: number;
    documentDeliveryDeadline: number;
    shippingDeadline: number;
    deliveryDeadline: number;
    arbiter: Address;
    incoterms: string;
    shipper: string;
    shippingPort: string;
    deliveryPort: string;
    lines: OrderLine[];
    token: Address;
    agreedAmount: number;
    escrowManager: Address;
    escrow: [Address] | [];
    shipmentId: [number] | [];
}
export const Order = IDL.Record({
    id: IDL.Nat,
    supplier: Address,
    customer: Address,
    commissioner: Address,
    signatures: IDL.Vec(Address),
    status: OrderStatus,
    paymentDeadline: IDL.Nat,
    documentDeliveryDeadline: IDL.Nat,
    shippingDeadline: IDL.Nat,
    deliveryDeadline: IDL.Nat,
    arbiter: Address,
    incoterms: IDL.Text,
    shipper: IDL.Text,
    shippingPort: IDL.Text,
    deliveryPort: IDL.Text,
    lines: IDL.Vec(OrderLine),
    token: Address,
    agreedAmount: IDL.Nat,
    escrowManager: Address,
    escrow: IDL.Opt(Address),
    shipmentId: IDL.Opt(IDL.Nat),
});
