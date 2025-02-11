export class ProductCategory {
    private _id: number;

    private _name: string;

    constructor(id: number, name: string) {
        this._id = id;
        this._name = name;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get name(): string {
        return this._name;
    }

    set name(value: string) {
        this._name = value;
    }

    static fromJson(json: any): ProductCategory {
        if(!json || json._id === undefined || json._name === undefined) {
            throw new Error('Invalid JSON');
        }
        return new ProductCategory(json._id, json._name);
    }
}
