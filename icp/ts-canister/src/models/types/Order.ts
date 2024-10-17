import {Price} from "./Price";

export type OrderStatus = { PENDING: null } | { CONFIRMED: null } | { EXPIRED: null };
export type OrderLine = {
    productCategoryId: bigint;
    quantity: number;
    unit: string;
    price: Price;
    // materialId: bigint | null;
}
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
