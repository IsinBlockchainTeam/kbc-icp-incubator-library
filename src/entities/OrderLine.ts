export type OrderLinePrice = {
    amount: number,
    fiat: string
}

export class OrderLine {
    private _id?: number;

    private _productCategory: string;

    private _quantity: number;

    private _price: OrderLinePrice;

    constructor(id: number, productCategory: string, quantity: number, price: OrderLinePrice);

    constructor(productCategory: string, quantity: number, price: OrderLinePrice);

    constructor(...args: any[]) {
        let startIndex = 0;
        if (typeof args[0] === 'number') {
            this._id = args[0];
            startIndex = 1;
        }
        this._productCategory = args[startIndex];
        this._quantity = args[startIndex + 1];
        this._price = args[startIndex + 2];
    }

    get id(): number | undefined {
        return this._id;
    }

    set id(value: number | undefined) {
        this._id = value;
    }

    get productCategory(): string {
        return this._productCategory;
    }

    set productCategory(value: string) {
        this._productCategory = value;
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
