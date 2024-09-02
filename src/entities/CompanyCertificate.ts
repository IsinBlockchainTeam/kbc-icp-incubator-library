import { BaseCertificate, CertificationType, DocumentEvaluationStatus } from './Certificate';

export class CompanyCertificate extends BaseCertificate {
    private _validFrom: Date;

    private _validUntil: Date;

    constructor(
        id: number,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificationType,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date
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
        this._validFrom = validFrom;
        this._validUntil = validUntil;
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
