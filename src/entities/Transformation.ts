export class Transformation {
    private _id: number;

    private _name: string;

    private _inputMaterialsIds: number[];

    private _outputMaterialId: number;

    private _owner: string;

    constructor(id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number, owner: string) {
        this._id = id;
        this._name = name;
        this._inputMaterialsIds = inputMaterialsIds;
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

    get inputMaterialsIds(): number[] {
        return this._inputMaterialsIds;
    }

    set inputMaterialsIds(value: number[]) {
        this._inputMaterialsIds = value;
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
