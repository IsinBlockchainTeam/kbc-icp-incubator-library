import { Trade, TradeType } from './Trade';

export class BasicTradeInfo extends Trade {
    private _name: string;

    constructor(id: number, supplier: string, customer: string, externalUrl: string, lineIds: number[], name: string) {
        super(id, supplier, customer, externalUrl, lineIds, TradeType.TRADE);
        this._name = name;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }
}
