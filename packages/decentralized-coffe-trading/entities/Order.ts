import { OrderLine } from './OrderLine';

export class Order {
    private _id?: number;

    private _supplier: string;

    private _contractId: number;

    private _lines: OrderLine[];

    private _lineIds: number[];

    private _externalUrl: string;

    constructor(id: number, supplier: string, contractId: number, externalUrl: string, lineIds?: number[], lines?: OrderLine[]);

    constructor(supplier: string, contractId: number, externalUrl: string, lineIds?: number[], lines?: OrderLine[]);

    constructor(...args: any[]) {
        let startIndex = 0;
        if (typeof args[0] === 'number') {
            this._id = args[0];
            startIndex = 1;
        }
        this._supplier = args[startIndex];
        this._contractId = args[startIndex + 1];
        this._externalUrl = args[startIndex + 2];
        this._lineIds = args[startIndex + 3] ? args[startIndex + 3] : [];
        this._lines = args[startIndex + 4] ? args[startIndex + 4] : [];
    }

    get id(): number | undefined {
        return this._id;
    }

    set id(value: number | undefined) {
        this._id = value;
    }

    get supplier(): string {
        return this._supplier;
    }

    set supplier(value: string) {
        this._supplier = value;
    }

    get contractId(): number {
        return this._contractId;
    }

    set contractId(value: number) {
        this._contractId = value;
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

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }
}
