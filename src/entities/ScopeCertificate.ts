import {
    BaseCertificate,
    CertificateDocumentInfo,
    CertificateType,
    DocumentEvaluationStatus
} from './Certificate';

export class ScopeCertificate extends BaseCertificate {
    private _processTypes: string[];

    private _validFrom: number;

    private _validUntil: number;

    constructor(
        id: number,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificateType,
        issueDate: number,
        processTypes: string[],
        validFrom: number,
        validUntil: number
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

    get validFrom(): number {
        return this._validFrom;
    }

    set validFrom(value: number) {
        this._validFrom = value;
    }

    get validUntil(): number {
        return this._validUntil;
    }

    set validUntil(value: number) {
        this._validUntil = value;
    }
}
