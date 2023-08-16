export class Relationship {
    private _id: number;

    private _companyA: string;

    private _companyB: string;

    private _validFrom: Date;

    private _validUntil?: Date;

    constructor(id: number, companyA: string, companyB: string, validFrom: Date, validUntil: Date) {
        this._id = id;
        this._companyA = companyA;
        this._companyB = companyB;
        this._validFrom = validFrom;
        this._validUntil = validUntil.getTime() !== 0 ? validUntil : undefined;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get companyA(): string {
        return this._companyA;
    }

    set companyA(value: string) {
        this._companyA = value;
    }

    get companyB(): string {
        return this._companyB;
    }

    set companyB(value: string) {
        this._companyB = value;
    }

    get validFrom(): Date {
        return this._validFrom;
    }

    set validFrom(value: Date) {
        this._validFrom = value;
    }

    get validUntil(): Date | undefined {
        return this._validUntil;
    }

    set validUntil(value: Date | undefined) {
        this._validUntil = value;
    }
}
