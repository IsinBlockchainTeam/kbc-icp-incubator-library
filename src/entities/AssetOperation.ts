import { Material } from './Material';

export class AssetOperation {
    private _id: number;

    private _name: string;

    private _inputMaterials: Material[];

    private _outputMaterial: Material;

    private _latitude: string;

    private _longitude: string;

    private _processTypes: string[];

    constructor(
        id: number,
        name: string,
        inputMaterials: Material[],
        outputMaterial: Material,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ) {
        this._id = id;
        this._name = name;
        this._inputMaterials = inputMaterials;
        this._outputMaterial = outputMaterial;
        this._latitude = latitude;
        this._longitude = longitude;
        this._processTypes = processTypes;
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

    get outputMaterial(): Material {
        return this._outputMaterial;
    }

    set outputMaterial(value: Material) {
        this._outputMaterial = value;
    }

    get latitude(): string {
        return this._latitude;
    }

    set latitude(value: string) {
        this._latitude = value;
    }

    get longitude(): string {
        return this._longitude;
    }

    set longitude(value: string) {
        this._longitude = value;
    }

    get processTypes(): string[] {
        return this._processTypes;
    }

    set processTypes(value: string[]) {
        this._processTypes = value;
    }
}
