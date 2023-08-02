import { ContractLine } from './ContractLine';

export class Contract {
    private _id?: number;

    private _lines: ContractLine[];

    private _lineIds: number[];

    private _supplier: string;

    private _customer: string;

    private _externalUrl: string;

    private _offeree: string;

    private _offereeSigned: boolean;

    private _offeror?: string;

    private _offerorSigned: boolean;

    constructor(id: number, supplier: string, customer: string, externalUrl: string, offeree: string, offeror?: string, lineIds?: number[], lines?: ContractLine[]);

    constructor(supplier: string, customer: string, externalUrl: string, offeree: string, offeror?: string, lineIds?: number[], lines?: ContractLine[]);

    constructor(...args: any[]) {
        let startIndex = 0;
        if (typeof args[0] === 'number') {
            this._id = args[0];
            startIndex = 1;
        }
        this._supplier = args[startIndex];
        this._customer = args[startIndex + 1];
        this._externalUrl = args[startIndex + 2];
        this._offeree = args[startIndex + 3];
        this._offeror = args[startIndex + 4];
        this._lineIds = args[startIndex + 5] ? args[startIndex + 5] : [];
        this._lines = args[startIndex + 6] ? args[startIndex + 6] : [];
        this._offereeSigned = false;
        this._offerorSigned = false;
    }

    get id(): number | undefined {
        return this._id;
    }

    set id(value: number | undefined) {
        this._id = value;
    }

    get lines(): ContractLine[] {
        return this._lines;
    }

    set lines(value: ContractLine[]) {
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

    get offeror(): string | undefined {
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

    set offeror(value: string | undefined) {
        this._offeror = value;
    }

    set offerorSigned(value: boolean) {
        this._offerorSigned = value;
    }
}
