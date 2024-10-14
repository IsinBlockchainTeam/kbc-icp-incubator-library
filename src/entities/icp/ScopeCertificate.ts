import {
    BaseCertificate,
    CertificateDocument,
    CertificateType,
    DocumentEvaluationStatus
} from './Certificate';

export class ScopeCertificate extends BaseCertificate {
    private _processTypes: string[];

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
        document: CertificateDocument,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificateType,
        issueDate: Date,
        processTypes: string[],
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
        this._processTypes = processTypes;
        this._validFrom = validFrom;
        this._validUntil = validUntil;
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
