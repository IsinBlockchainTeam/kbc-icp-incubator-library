export class ProductCategory {
    private _id: number;

    private _name: string;

    private _quality: number;

    private _description: string;

    constructor(id: number, name: string, quality: number, description: string) {
        this._id = id;
        this._name = name;
        this._quality = quality;
        this._description = description;
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

    get quality(): number {
        return this._quality;
    }

    set quality(value: number) {
        this._quality = value;
    }

    get description(): string {
        return this._description;
    }

    set description(value: string) {
        this._description = value;
    }
}
