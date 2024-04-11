import { Certificate } from './Certificate';

export class CompanyCertificate extends Certificate {
    private _company: string;

    private _validFrom: Date;

    private _validUntil: Date;

    constructor(id: number, issuer: string, company: string, assessmentStandard: string, documentId: number, issueDate: Date, validFrom: Date, validUntil: Date) {
        super(id, issuer, assessmentStandard, documentId, issueDate);
        this._company = company;
        this._validFrom = validFrom;
        this._validUntil = validUntil;
    }

    get company(): string {
        return this._company;
    }

    set company(value: string) {
        this._company = value;
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
