import {IDL} from "azle";
import {IDLPrice as IDLPrice} from "./Price";
import {IDLShipment} from "./Shipment";
import {IDLProductCategory} from "./ProductCategory";

export const IDLOrderStatus = IDL.Variant({
    PENDING: IDL.Null,
    CONFIRMED: IDL.Null,
    EXPIRED: IDL.Null,
});
export const IDLOrderLineRaw = IDL.Record({
    productCategoryId: IDL.Nat,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: IDLPrice,
});
export const IDLOrderLine = IDL.Record({
    productCategory: IDLProductCategory,
    quantity: IDL.Float32,
    unit: IDL.Text,
    price: IDLPrice,
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
    shipmentId: IDL.Opt(IDL.Nat),
});
