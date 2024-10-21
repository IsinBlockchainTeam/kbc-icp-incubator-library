import { BaseCertificate, CertificateDocumentInfo, CertificateType } from './Certificate';
import { EvaluationStatus } from './Document';

export class CompanyCertificate extends BaseCertificate {
    private _validFrom: Date;

    private _validUntil: Date;

    constructor(
        id: number,
        issuer: string,
        subject: string,
        uploadedBy: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocumentInfo,
        evaluationStatus: EvaluationStatus,
        certificateType: CertificateType,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date
    ) {
        super(
            id,
            issuer,
            subject,
            uploadedBy,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
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
