export abstract class Organization {
    private _ethAddress: string;

    private _name: string;

    protected constructor(ethAddress: string, name: string) {
        this._ethAddress = ethAddress;
        this._name = name;
    }

    get ethAddress(): string {
        return this._ethAddress;
    }

    set ethAddress(ethAddress: string) {
        this._ethAddress = ethAddress;
    }

    get name(): string {
        return this._name;
    }

    set name(name: string) {
        this._name = name;
    }
}
