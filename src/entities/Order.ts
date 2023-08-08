import { OrderLine } from './OrderLine';

export class Order {
    private _id: number;

    private _lines: OrderLine[];

    private _lineIds: number[];

    private _supplier: string;

    private _customer: string;

    private _externalUrl: string;

    private _offeree: string;

    private _offereeSigned: boolean;

    private _offeror: string;

    private _offerorSigned: boolean;

    constructor(id: number, supplier: string, customer: string, externalUrl: string, offeree: string, offeror: string, lineIds: number[], lines?: OrderLine[]) {
        this._id = id;
        this._supplier = supplier;
        this._customer = customer;
        this._externalUrl = externalUrl;
        this._offeree = offeree;
        this._offeror = offeror;
        this._lineIds = lineIds;
        this._lines = lines ? lines : [];
        this._offereeSigned = false;
        this._offerorSigned = false;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get lines(): OrderLine[] {
        return this._lines;
    }

    set lines(value: OrderLine[]) {
        this._lines = value;
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

    get offeree(): string {
        return this._offeree;
    }

    get offereeSigned(): boolean {
        return this._offereeSigned;
    }

    get offeror(): string {
        return this._offeror;
    }

    get offerorSigned(): boolean {
        return this._offerorSigned;
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

    set offeree(value: string) {
        this._offeree = value;
    }

    set offereeSigned(value: boolean) {
        this._offereeSigned = value;
    }

    set offeror(value: string) {
        this._offeror = value;
    }

    set offerorSigned(value: boolean) {
        this._offerorSigned = value;
    }
}
