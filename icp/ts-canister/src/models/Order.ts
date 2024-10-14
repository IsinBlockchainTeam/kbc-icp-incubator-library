import { IDL } from 'azle';
import { Price } from './Price';

export const OrderStatus = IDL.Variant({
    PENDING: IDL.Null,
    CONFIRMED: IDL.Null,
    EXPIRED: IDL.Null
});
export type OrderStatus = { PENDING: null } | { CONFIRMED: null } | { EXPIRED: null };
export type OrderLine = {
    productCategoryId: number;
    quantity: number;
    unit: string;
    price: Price;
    // materialId: number | null;
};
export const OrderLine = IDL.Record({
    productCategoryId: IDL.Nat,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: Price
    // materialId: IDL.Opt(IDL.Nat),
});
export type Order = {
    id: number;
    supplier: string;
    customer: string;
    commissioner: string;
    signatures: string[];
    status: OrderStatus;
    paymentDeadline: number;
    documentDeliveryDeadline: number;
    shippingDeadline: number;
    deliveryDeadline: number;
    arbiter: string;
    lines: OrderLine[];
    token: string;
    agreedAmount: number;
    escrowManager: string;
    escrow: [string] | [];
    shipmentId: [number] | [];
};
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
    lines: IDL.Vec(OrderLine),
    token: IDL.Text,
    agreedAmount: IDL.Nat,
    escrowManager: IDL.Text,
    escrow: IDL.Opt(IDL.Text),
    shipmentId: IDL.Opt(IDL.Nat)
});
