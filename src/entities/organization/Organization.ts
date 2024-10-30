export abstract class Organization {
    private _id: number;

    private _name: string;

    protected constructor(id: number, name: string) {
        this._id = id;
        this._name = name;
    }

    get id(): number {
        return this._id;
    }

    set id(id: number) {
        this._id = id;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }
}
