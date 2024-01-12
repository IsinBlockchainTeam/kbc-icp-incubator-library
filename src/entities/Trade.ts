export class LineRequest {
    protected _materialsId: [number, number];

    protected _productCategory: string;

    constructor(materialsId: [number, number], productCategory: string) {
        this._materialsId = materialsId;
        this._productCategory = productCategory;
    }

    get materialsId(): [number, number] {
        return this._materialsId;
    }

    set materialsId(value: [number, number]) {
        this._materialsId = value;
    }

    get productCategory(): string {
        return this._productCategory;
    }

    set productCategory(value: string) {
        this._productCategory = value;
    }
}

export class Line {
    protected _id: number;

    protected _materialsId: [number, number];

    protected _productCategory: string;

    constructor(id: number, materialsId: [number, number], productCategory: string) {
        this._id = id;
        this._materialsId = materialsId;
        this._productCategory = productCategory;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get materialsId(): [number, number] {
        return this._materialsId;
    }

    set materialsId(value: [number, number]) {
        this._materialsId = value;
    }

    get productCategory(): string {
        return this._productCategory;
    }

    set productCategory(value: string) {
        this._productCategory = value;
    }
}

export abstract class Trade {
    protected _tradeId: number;

    protected _supplier: string;

    protected _customer: string;

    protected _commissioner: string;

    protected _externalUrl: string;

    protected _lines: Line[];

    protected constructor(tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: Line[]) {
        this._tradeId = tradeId;
        this._supplier = supplier;
        this._customer = customer;
        this._commissioner = commissioner;
        this._externalUrl = externalUrl;
        this._lines = lines;
    }

    get tradeId(): number {
        return this._tradeId;
    }

    set tradeId(value: number) {
        this._tradeId = value;
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

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get lines(): Line[] {
        return this._lines;
    }

    set lines(value: Line[]) {
        this._lines = value;
    }
}
