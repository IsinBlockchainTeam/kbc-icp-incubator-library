import { Trade } from './Trade';

export class OrderInfo extends Trade {
    private _offeree: string;

    private _offereeSigned: boolean;

    private _offeror: string;

    private _offerorSigned: boolean;

    private _paymentDeadline?: Date;

    private _documentDeliveryDeadline?: Date;

    private _arbiter?: string;

    private _shippingDeadline?: Date;

    private _deliveryDeadline?: Date;

    constructor(id: number, supplier: string, customer: string, externalUrl: string, offeree: string, offeror: string, lineIds: number[], paymentDeadline: Date, documentDeliveryDeadline: Date, arbiter: string, shippingDeadline: Date, deliveryDeadline: Date) {
        super(id, supplier, customer, externalUrl, lineIds);
        this._offeree = offeree;
        this._offeror = offeror;
        this._offereeSigned = false;
        this._offerorSigned = false;
        this._paymentDeadline = paymentDeadline.getTime() !== 0 ? paymentDeadline : undefined;
        this._documentDeliveryDeadline = documentDeliveryDeadline.getTime() !== 0 ? documentDeliveryDeadline : undefined;
        this._arbiter = arbiter !== '' ? arbiter : undefined;
        this._shippingDeadline = shippingDeadline.getTime() !== 0 ? shippingDeadline : undefined;
        this._deliveryDeadline = deliveryDeadline.getTime() !== 0 ? deliveryDeadline : undefined;
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

    get arbiter(): string | undefined {
        return this._arbiter;
    }

    set arbiter(value: string | undefined) {
        this._arbiter = value;
    }

    get shippingDeadline(): Date | undefined {
        return this._shippingDeadline;
    }

    set shippingDeadline(value: Date | undefined) {
        this._shippingDeadline = value;
    }

    get deliveryDeadline(): Date | undefined {
        return this._deliveryDeadline;
    }

    set deliveryDeadline(value: Date | undefined) {
        this._deliveryDeadline = value;
    }
}
