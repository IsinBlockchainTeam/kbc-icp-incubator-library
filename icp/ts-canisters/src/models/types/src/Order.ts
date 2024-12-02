import { Price } from "./Price";
import { ProductCategory } from "./ProductCategory";

export enum OrderStatusEnum {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    EXPIRED = "EXPIRED",
}
export type OrderStatus =
    | { PENDING: null }
    | { CONFIRMED: null }
    | { EXPIRED: null };
export type OrderLineRaw = {
    productCategoryId: bigint;
    quantity: number;
    unit: string;
    price: Price;
};
export type OrderLine = {
    productCategory: ProductCategory;
    quantity: number;
    unit: string;
    price: Price;
};
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
    shipmentId: [bigint] | [];
};
