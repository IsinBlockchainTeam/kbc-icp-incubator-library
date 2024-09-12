import {
    BaseCertificate,
    CertificateDocumentInfo,
    CertificateType,
    DocumentEvaluationStatus
} from './Certificate';

export class CompanyCertificate extends BaseCertificate {
    private _validFrom: Date;

    private _validUntil: Date;

    constructor(
        id: number,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificateType,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date
    ) {
        super(
            id,
            issuer,
            subject,
            assessmentStandard,
            document,
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
