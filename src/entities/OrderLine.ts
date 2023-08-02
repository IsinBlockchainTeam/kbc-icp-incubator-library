export class OrderLine {
    private _id?: number;

    private _contractLineId: number;

    private _quantity: number;

    constructor(id: number, contractLineId: number, quantity: number);

    constructor(contractLineId: number, quantity: number);

    constructor(...args: any[]) {
        let startIndex = 0;
        if (args.length === 3) {
            this._id = args[0];
            startIndex = 1;
        }
        this._contractLineId = args[startIndex];
        this._quantity = args[startIndex + 1];
    }

    get id(): number | undefined {
        return this._id;
    }

    set id(value: number | undefined) {
        this._id = value;
    }

    get contractLineId(): number {
        return this._contractLineId;
    }

    set contractLineId(value: number) {
        this._contractLineId = value;
    }

    get quantity(): number {
        return this._quantity;
    }

    set quantity(value: number) {
        this._quantity = value;
    }
}
