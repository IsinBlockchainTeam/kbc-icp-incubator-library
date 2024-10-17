export type OrderLinePrice = {
    amount: number;
    fiat: string;
}
export type OrderLine = {
    productCategoryId: number;
    quantity: number;
    unit: string;
    price: OrderLinePrice;
}
export enum OrderStatus {
    PENDING = "PENDING",
    CONFIRMED = "CONFIRMED",
    EXPIRED = "EXPIRED"
}
export class Order {
    private _id: number;

    private _supplier: string;

    private _customer: string;

    private _commissioner: string;

    private _signatures: string[];

    private _status: OrderStatus;

    private _paymentDeadline: Date;

    private _documentDeliveryDeadline: Date;

    private _shippingDeadline: Date;

    private _deliveryDeadline: Date;

    private _arbiter: string;

    private _incoterms: string;

    private _shipper: string;

    private _shippingPort: string;

    private _deliveryPort: string;

    private _lines: OrderLine[];

    private _token: string;

    private _agreedAmount: number;

    private _shipmentId: number;


    constructor(id: number, supplier: string, customer: string, commissioner: string, signatures: string[], status: OrderStatus, paymentDeadline: Date, documentDeliveryDeadline: Date, shippingDeadline: Date, deliveryDeadline: Date, arbiter: string, incoterms: string, shipper: string, shippingPort: string, deliveryPort: string, lines: OrderLine[], token: string, agreedAmount: number, shipmentId: number) {
        this._id = id;
        this._supplier = supplier;
        this._customer = customer;
        this._commissioner = commissioner;
        this._signatures = signatures;
        this._status = status;
        this._paymentDeadline = paymentDeadline;
        this._documentDeliveryDeadline = documentDeliveryDeadline;
        this._shippingDeadline = shippingDeadline;
        this._deliveryDeadline = deliveryDeadline;
        this._arbiter = arbiter;
        this._incoterms = incoterms;
        this._shipper = shipper;
        this._shippingPort = shippingPort;
        this._deliveryPort = deliveryPort;
        this._lines = lines;
        this._token = token;
        this._agreedAmount = agreedAmount;
        this._shipmentId = shipmentId;
    }


    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get supplier(): string {
        return this._supplier;
    }

    set supplier(value: string) {
        this._supplier = value;
    }

    get customer(): string {
        return this._customer;
    }

    set customer(value: string) {
        this._customer = value;
    }

    get commissioner(): string {
        return this._commissioner;
    }

    set commissioner(value: string) {
        this._commissioner = value;
    }

    get signatures(): string[] {
        return this._signatures;
    }

    set signatures(value: string[]) {
        this._signatures = value;
    }

    get status(): OrderStatus {
        return this._status;
    }

    set status(value: OrderStatus) {
        this._status = value;
    }

    get paymentDeadline(): Date {
        return this._paymentDeadline;
    }

    set paymentDeadline(value: Date) {
        this._paymentDeadline = value;
    }

    get documentDeliveryDeadline(): Date {
        return this._documentDeliveryDeadline;
    }

    set documentDeliveryDeadline(value: Date) {
        this._documentDeliveryDeadline = value;
    }

    get shippingDeadline(): Date {
        return this._shippingDeadline;
    }

    set shippingDeadline(value: Date) {
        this._shippingDeadline = value;
    }

    get deliveryDeadline(): Date {
        return this._deliveryDeadline;
    }

    set deliveryDeadline(value: Date) {
        this._deliveryDeadline = value;
    }

    get arbiter(): string {
        return this._arbiter;
    }

    set arbiter(value: string) {
        this._arbiter = value;
    }

    get incoterms(): string {
        return this._incoterms;
    }

    set incoterms(value: string) {
        this._incoterms = value;
    }

    get shipper(): string {
        return this._shipper;
    }

    set shipper(value: string) {
        this._shipper = value;
    }

    get shippingPort(): string {
        return this._shippingPort;
    }

    set shippingPort(value: string) {
        this._shippingPort = value;
    }

    get deliveryPort(): string {
        return this._deliveryPort;
    }

    set deliveryPort(value: string) {
        this._deliveryPort = value;
    }

    get lines(): OrderLine[] {
        return this._lines;
    }

    set lines(value: OrderLine[]) {
        this._lines = value;
    }

    get token(): string {
        return this._token;
    }

    set token(value: string) {
        this._token = value;
    }

    get agreedAmount(): number {
        return this._agreedAmount;
    }

    set agreedAmount(value: number) {
        this._agreedAmount = value;
    }

    get shipmentId(): number {
        return this._shipmentId;
    }

    set shipmentId(value: number) {
        this._shipmentId = value;
    }
}
