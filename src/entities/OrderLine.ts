import { TradeLine } from './TradeLine';

export class OrderLinePrice {
    private _amount: number;

    private _fiat: string;

    constructor(amount: number, fiat: string) {
        this._amount = amount;
        this._fiat = fiat;
    }

    get amount(): number {
        return this._amount;
    }

    set amount(value: number) {
        this._amount = value;
    }

    get fiat(): string {
        return this._fiat;
    }

    set fiat(value: string) {
        this._fiat = value;
    }
}

export class OrderLine extends TradeLine {
    private _quantity: number;

    private _price: OrderLinePrice;

    constructor(id: number, materialIds: [number, number], productCategory: string, quantity: number, price: OrderLinePrice) {
        super(id, materialIds, productCategory);
        this._quantity = quantity;
        this._price = price;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }

    get price(): OrderLinePrice {
        return this._price;
    }

    set price(value: OrderLinePrice) {
        this._price = value;
    }
}
