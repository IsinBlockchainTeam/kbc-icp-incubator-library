export class Order {
    private _id: number;

    private _lineIds: number[];

    private _supplier: string;

    private _customer: string;

    private _externalUrl: string;

    private _offeree: string;

    private _offereeSigned: boolean;

    private _offeror: string;

    private _offerorSigned: boolean;

    private _incoterms?: string;

    private _paymentDeadline?: Date;

    private _documentDeliveryDeadline?: Date;

    private _shipper?: string;

    private _arbiter?: string;

    private _shippingPort?: string;

    private _shippingDeadline?: Date;

    private _deliveryPort?: string;

    private _deliveryDeadline?: Date;

    constructor(id: number, supplier: string, customer: string, externalUrl: string, offeree: string, offeror: string, lineIds: number[], incoterms: string, paymentDeadline: Date, documentDeliveryDeadline: Date, shipper: string, arbiter: string, shippingPort: string, shippingDeadline: Date, deliveryPort: string, deliveryDeadline: Date) {
        this._id = id;
        this._supplier = supplier;
        this._customer = customer;
        this._externalUrl = externalUrl;
        this._offeree = offeree;
        this._offeror = offeror;
        this._lineIds = lineIds;
        this._offereeSigned = false;
        this._offerorSigned = false;
        this._incoterms = incoterms !== '' ? incoterms : undefined;
        this._paymentDeadline = paymentDeadline.getTime() !== 0 ? paymentDeadline : undefined;
        this._documentDeliveryDeadline = documentDeliveryDeadline.getTime() !== 0 ? documentDeliveryDeadline : undefined;
        this._shipper = shipper !== '' ? shipper : undefined;
        this._arbiter = arbiter !== '' ? arbiter : undefined;
        this._shippingPort = shippingPort !== '' ? shippingPort : undefined;
        this._shippingDeadline = shippingDeadline.getTime() !== 0 ? shippingDeadline : undefined;
        this._deliveryPort = deliveryPort !== '' ? deliveryPort : undefined;
        this._deliveryDeadline = deliveryDeadline.getTime() !== 0 ? deliveryDeadline : undefined;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get lineIds(): number[] {
        return this._lineIds;
    }

    set lineIds(value: number[]) {
        this._lineIds = value;
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

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get offeree(): string {
        return this._offeree;
    }

    set offeree(value: string) {
        this._offeree = value;
    }

    get offereeSigned(): boolean {
        return this._offereeSigned;
    }

    set offereeSigned(value: boolean) {
        this._offereeSigned = value;
    }

    get offeror(): string {
        return this._offeror;
    }

    set offeror(value: string) {
        this._offeror = value;
    }

    get offerorSigned(): boolean {
        return this._offerorSigned;
    }

    set offerorSigned(value: boolean) {
        this._offerorSigned = value;
    }

    get incoterms(): string | undefined {
        return this._incoterms;
    }

    set incoterms(value: string | undefined) {
        this._incoterms = value;
    }

    get paymentDeadline(): Date | undefined {
        return this._paymentDeadline;
    }

    set paymentDeadline(value: Date | undefined) {
        this._paymentDeadline = value;
    }

    get documentDeliveryDeadline(): Date | undefined {
        return this._documentDeliveryDeadline;
    }

    set documentDeliveryDeadline(value: Date | undefined) {
        this._documentDeliveryDeadline = value;
    }

    get shipper(): string | undefined {
        return this._shipper;
    }

    set shipper(value: string | undefined) {
        this._shipper = value;
    }

    get arbiter(): string | undefined {
        return this._arbiter;
    }

    set arbiter(value: string | undefined) {
        this._arbiter = value;
    }

    get shippingPort(): string | undefined {
        return this._shippingPort;
    }

    set shippingPort(value: string | undefined) {
        this._shippingPort = value;
    }

    get shippingDeadline(): Date | undefined {
        return this._shippingDeadline;
    }

    set shippingDeadline(value: Date | undefined) {
        this._shippingDeadline = value;
    }

    get deliveryPort(): string | undefined {
        return this._deliveryPort;
    }

    set deliveryPort(value: string | undefined) {
        this._deliveryPort = value;
    }

    get deliveryDeadline(): Date | undefined {
        return this._deliveryDeadline;
    }

    set deliveryDeadline(value: Date | undefined) {
        this._deliveryDeadline = value;
    }
}
