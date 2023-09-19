export enum TradeType {
    TRADE,
    ORDER
}

export abstract class Trade {
    private _id: number;

    private _name: string;

    private _supplier: string;

    private _customer: string;

    private readonly _externalUrl: string;

    private _lineIds?: number[];

    protected constructor(id: number, name: string, supplier: string, customer: string, externalUrl: string, lineIds?: number[]) {
        this._id = id;
        this._name = name;
        this._supplier = supplier;
        this._customer = customer;
        this._externalUrl = externalUrl;
        this._lineIds = lineIds;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get type(): TradeType {
        return this._type;
    }

    set type(value: TradeType) {
        this._type = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
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

    get lineIds(): number[] {
        return this._lineIds;
    }

    set lineIds(value: number[]) {
        this._lineIds = value;
    }
}
