import { BaseCertificate, CertificationType, DocumentEvaluationStatus } from './Certificate';

export class MaterialCertificate extends BaseCertificate {
    private _tradeId: number;

    private _lineId: number;

    constructor(
        id: number,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificationType,
        issueDate: Date,
        tradeId: number,
        lineId: number
    ) {
        super(
            id,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            evaluationStatus,
            certificateType,
            issueDate
        );
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
