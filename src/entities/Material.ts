import { ProductCategory } from './ProductCategory';

export class Material {
    private _id: number;

    private _productCategory: ProductCategory;

    constructor(id: number, productCategory: ProductCategory) {
        this._id = id;
        this._productCategory = productCategory;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get productCategory(): ProductCategory {
        return this._productCategory;
    }

    set productCategory(value: ProductCategory) {
        this._productCategory = value;
    }
}
