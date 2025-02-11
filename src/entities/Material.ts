import { ProductCategory } from './ProductCategory';

export class Material {
    private _id: number;

    private _owner: string;

    private _name: string;

    private _productCategory: ProductCategory;

    private _typology: string;

    private _quality: string;

    private _moisture: string;

    private _isInput: boolean;

    constructor(id: number, owner: string, name: string, productCategory: ProductCategory, typology: string, quality: string, moisture: string, isInput: boolean) {
        this._id = id;
        this._owner = owner;
        this._name = name;
        this._productCategory = productCategory;
        this._typology = typology;
        this._quality = quality;
        this._moisture = moisture;
        this._isInput = isInput;
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

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
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

    get isInput(): boolean {
        return this._isInput;
    }

    set isInput(value: boolean) {
        this._isInput = value;
    }

    static fromJson(json: any): Material {
        if(!json || json._id === undefined || json._owner === undefined || json._name === undefined || json._productCategory === undefined || json._typology === undefined || json._quality === undefined || json._moisture === undefined || json._isInput === undefined) {
            throw new Error('Invalid JSON');
        }
        return new Material(
            json._id,
            json._owner,
            json._name,
            ProductCategory.fromJson(json._productCategory),
            json._typology,
            json._quality,
            json._moisture,
            json._isInput
        );
    }
}
