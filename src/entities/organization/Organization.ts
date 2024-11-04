export abstract class Organization {
    private _ethAddress: string;

    private _legalName: string;

    protected constructor(ethAddress: string, legalName: string) {
        this._ethAddress = ethAddress;
        this._legalName = legalName;
    }

    get ethAddress(): string {
        return this._ethAddress;
    }

    set ethAddress(ethAddress: string) {
        this._ethAddress = ethAddress;
    }

    get legalName(): string {
        return this._legalName;
    }

    set legalName(name: string) {
        this._legalName = name;
    }
}
