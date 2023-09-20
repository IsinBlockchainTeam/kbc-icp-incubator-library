export class TradeLine {
    private _id: number;

    private _materialIds: [number, number];

    private _productCategory: string;

    constructor(id: number, materialIds: [number, number], productCategory: string) {
        this._id = id;
        this._materialIds = materialIds;
        this._productCategory = productCategory;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get materialIds(): [number, number] {
        return this._materialIds;
    }

    set materialIds(value: [number, number]) {
        this._materialIds = value;
    }

    get productCategory(): string {
        return this._productCategory;
    }

    set productCategory(value: string) {
        this._productCategory = value;
    }
}
