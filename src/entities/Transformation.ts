import { Material } from './Material';

export class Transformation {
    private _id: number;

    private _name: string;

    private _inputMaterials: Material[];

    private _outputMaterialId: number;

    private _owner: string;

    constructor(id: number, name: string, inputMaterials: Material[], outputMaterialId: number, owner: string) {
        this._id = id;
        this._name = name;
        this._inputMaterials = inputMaterials;
        this._outputMaterialId = outputMaterialId;
        this._owner = owner;
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

    get inputMaterials(): Material[] {
        return this._inputMaterials;
    }

    set inputMaterials(value: Material[]) {
        this._inputMaterials = value;
    }

    get outputMaterialId(): number {
        return this._outputMaterialId;
    }

    set outputMaterialId(value: number) {
        this._outputMaterialId = value;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this._owner = value;
    }
}
