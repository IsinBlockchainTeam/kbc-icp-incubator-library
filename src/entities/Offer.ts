import { Material } from './Material';

export class Offer {
    private _id: number;

    private _owner: string;

    private _material: Material;

    constructor(id: number, owner: string, material: Material) {
        this._id = id;
        this._owner = owner;
        this._material = material;
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

    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        this._material = value;
    }
}
