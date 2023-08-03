export class Trade {
    private _id: number;

    private _name: string;

    private _materialsIds: [number, number][]; // array of [materialInId, materialOutId]

    private _owner: string;

    constructor(id: number, name: string, materialsIds: [number, number][], owner: string) {
        this._id = id;
        this._name = name;
        this._materialsIds = materialsIds;
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

    get materialsIds(): [number, number][] {
        return this._materialsIds;
    }

    set materialsIds(value: [number, number][]) {
        this._materialsIds = value;
    }

    get owner(): string {
        return this._owner;
    }

    set owner(value: string) {
        this._owner = value;
    }
}
