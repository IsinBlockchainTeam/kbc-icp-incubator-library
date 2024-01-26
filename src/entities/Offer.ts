import {ProductCategory} from "./ProductCategory";

export class Offer {
    private _id: number;

    private _owner: string;

    private _productCategory: ProductCategory;

    constructor(id: number, owner: string, productCategory: ProductCategory) {
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

    get productCategory(): ProductCategory {
        return this._productCategory;
    }

    set productCategory(value: ProductCategory) {
        this._productCategory = value;
    }
}
