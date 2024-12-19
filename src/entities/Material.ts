import { ProductCategory } from './ProductCategory';

export class Material {
    private _id: number;

    private _productCategory: ProductCategory;

    private _typology: string;

    private _quality: string;

    private _moisture: string;

    constructor(id: number, productCategory: ProductCategory, typology: string, quality: string, moisture: string) {
        this._id = id;
        this._productCategory = productCategory;
        this._typology = typology;
        this._quality = quality;
        this._moisture = moisture;
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

    get typology(): string {
        return this._typology;
    }

    set typology(value: string) {
        this._typology = value;
    }

    get quality(): string {
        return this._quality;
    }

    set quality(value: string) {
        this._quality = value;
    }

    get moisture(): string {
        return this._moisture;
    }

    set moisture(value: string) {
        this._moisture = value;
    }
}
