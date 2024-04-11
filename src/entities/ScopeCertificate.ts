import { Certificate } from './Certificate';

export class ScopeCertificate extends Certificate {
    private _company: string;

    private _processTypes: string[];

    private _validFrom: Date;

    private _validUntil: Date;

    constructor(id: number, issuer: string, assessmentStandard: string, documentId: number, issueDate: Date, company: string, processTypes: string[], validFrom: Date, validUntil: Date) {
        super(id, issuer, assessmentStandard, documentId, issueDate);
        this._company = company;
        this._processTypes = processTypes;
        this._validFrom = validFrom;
        this._validUntil = validUntil;
    }

    get company(): string {
        return this._company;
    }

    set company(value: string) {
        this._company = value;
    }

    get processTypes(): string[] {
        return this._processTypes;
    }

    set processTypes(value: string[]) {
        this._processTypes = value;
    }

    get validFrom(): Date {
        return this._validFrom;
    }

    set validFrom(value: Date) {
        this._validFrom = value;
    }

    get validUntil(): Date {
        return this._validUntil;
    }

    set validUntil(value: Date) {
        this._validUntil = value;
    }
}
