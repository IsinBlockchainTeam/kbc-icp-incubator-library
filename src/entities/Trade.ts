import { Material } from './Material';
import { ProductCategory } from './ProductCategory';

export class LineRequest {
    private _material?: Material;

    private _productCategory: ProductCategory;

    constructor(material: Material, productCategory: ProductCategory) {
        this._material = material;
        this._productCategory = productCategory;
    }

    get material(): Material | undefined {
        return this._material;
    }

    set material(value: Material | undefined) {
        this._material = value;
    }

    get productCategory(): ProductCategory {
        return this._productCategory;
    }

    set productCategory(value: ProductCategory) {
        this._productCategory = value;
    }
}

export class Line {
    private _id: number;

    private _material?: Material;

    private _productCategory: ProductCategory;

    constructor(id: number, material: Material | undefined, productCategory: ProductCategory) {
        this._id = id;
        this._material = material;
        this._productCategory = productCategory;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get material(): Material | undefined {
        return this._material;
    }

    set material(value: Material | undefined) {
        this._material = value;
    }

    get productCategory(): ProductCategory {
        return this._productCategory;
    }

    set productCategory(value: ProductCategory) {
        this._productCategory = value;
    }
}

export abstract class Trade {
    protected _tradeId: number;

    protected _supplier: string;

    protected _customer: string;

    protected _commissioner: string;

    protected _externalUrl: string;

    protected _lines: Line[];

    protected constructor(tradeId: number, supplier: string, customer: string, commissioner: string, externalUrl: string, lines: Line[]) {
        this._tradeId = tradeId;
        this._supplier = supplier;
        this._customer = customer;
        this._commissioner = commissioner;
        this._externalUrl = externalUrl;
        this._lines = lines;
    }

    get tradeId(): number {
        return this._tradeId;
    }

    set tradeId(value: number) {
        this._tradeId = value;
    }

    get supplier(): string {
        return this._supplier;
    }

    set supplier(value: string) {
        this._supplier = value;
    }

    get customer(): string {
        return this._customer;
    }

    set customer(value: string) {
        this._customer = value;
    }

    get commissioner(): string {
        return this._commissioner;
    }

    set commissioner(value: string) {
        this._commissioner = value;
    }

    get externalUrl(): string {
        return this._externalUrl;
    }

    set externalUrl(value: string) {
        this._externalUrl = value;
    }

    get lines(): Line[] {
        return this._lines;
    }

    set lines(value: Line[]) {
        this._lines = value;
    }
}
