import { Line, Trade } from './Trade';

export class BasicTrade extends Trade {
    private _name: string;

    constructor(tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: Line[], name: string) {
        super(tradeId, supplier, customer, commissioner, externalUrl, lines);
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    set name(newName: string) {
        this._name = newName;
    }
}
