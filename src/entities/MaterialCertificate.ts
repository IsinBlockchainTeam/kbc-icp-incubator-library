import { Certificate } from './Certificate';

export class MaterialCertificate extends Certificate {
    private _tradeId: number;

    private _lineId: number;

    constructor(id: number, issuer: string, assessmentStandard: string, documentId: number, issueDate: Date, tradeId: number, lineId: number) {
        super(id, issuer, assessmentStandard, documentId, issueDate);
        this._tradeId = tradeId;
        this._lineId = lineId;
    }

    get tradeId(): number {
        return this._tradeId;
    }

    set tradeId(value: number) {
        this._tradeId = value;
    }

    get lineId(): number {
        return this._lineId;
    }

    set lineId(value: number) {
        this._lineId = value;
    }
}
