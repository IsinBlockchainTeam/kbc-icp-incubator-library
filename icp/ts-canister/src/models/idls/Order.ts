import { IDL } from 'azle';
import { IDLPrice } from './Price';

export const IDLOrderStatus = IDL.Variant({
    PENDING: IDL.Null,
    CONFIRMED: IDL.Null,
    EXPIRED: IDL.Null
});
export const IDLOrderLine = IDL.Record({
    productCategoryId: IDL.Nat,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: IDLPrice
    // materialId: IDL.Opt(IDL.Nat),
});
export const IDLOrder = IDL.Record({
    id: IDL.Nat,
    supplier: IDL.Text,
    customer: IDL.Text,
    commissioner: IDL.Text,
    signatures: IDL.Vec(IDL.Text),
    status: IDLOrderStatus,
    paymentDeadline: IDL.Nat,
    documentDeliveryDeadline: IDL.Nat,
    shippingDeadline: IDL.Nat,
    deliveryDeadline: IDL.Nat,
    arbiter: IDL.Text,
    incoterms: IDL.Text,
    shipper: IDL.Text,
    shippingPort: IDL.Text,
    deliveryPort: IDL.Text,
    lines: IDL.Vec(IDLOrderLine),
    token: IDL.Text,
    agreedAmount: IDL.Nat,
    escrowManager: IDL.Text,
    escrow: IDL.Opt(IDL.Text),
    shipmentId: IDL.Opt(IDL.Nat)
});
