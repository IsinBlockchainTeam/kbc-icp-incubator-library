export class Material {
    private _id: number;

    private _name: string;

    private _owner: string;

    constructor(id: number, name: string, owner: string) {
        this._id = id;
        this._name = name;
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

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this._owner = value;
    }
}
