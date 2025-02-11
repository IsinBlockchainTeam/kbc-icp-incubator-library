export class BusinessRelation{
    private _ethAddressA: string;
    private _ethAddressB: string;

    constructor(ethAddressA: string, ethAddressB: string) {
        this._ethAddressA = ethAddressA;
        this._ethAddressB = ethAddressB;
    }

    get ethAddressA(): string {
        return this._ethAddressA;
    }
    get ethAddressB(): string {
        return this._ethAddressB;
    }
}