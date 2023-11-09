export class Offer {
    private _id: number;

    private _owner: string;

    private _productCategory: string;

    constructor(id: number, owner: string, productCategory: string) {
        this._id = id;
        this._owner = owner;
        this._productCategory = productCategory;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this._owner = value;
    }

    get productCategory(): string {
        return this._productCategory;
    }

    set productCategory(value: string) {
        this._productCategory = value;
    }
}
