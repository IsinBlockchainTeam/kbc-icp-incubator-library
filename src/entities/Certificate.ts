export enum CertificateType {
    COMPANY,
    SCOPE,
    MATERIAL
}

export enum DocumentType {
    CERTIFICATE_OF_CONFORMITY,
    COUNTRY_OF_ORIGIN,
    SWISS_DECODE,
    PRODUCTION_REPORT,
    PRODUCTION_FACILITY_LICENSE
}

export enum DocumentEvaluationStatus {
    NOT_EVALUATED,
    APPROVED,
    NOT_APPROVED
}

export type CertificateDocumentInfo = {
    id: number;
    documentType: DocumentType;
};

export class BaseCertificate {
    private _id: number;

    private _issuer: string;

    private _subject: string;

    private _assessmentStandard: string;

    private _document: CertificateDocumentInfo;

    private _evaluationStatus: DocumentEvaluationStatus;

    private _certificateType: CertificateType;

    private _issueDate: number;

    constructor(
        id: number,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificateType,
        issueDate: number
    ) {
        this._id = id;
        this._issuer = issuer;
        this._subject = subject;
        this._assessmentStandard = assessmentStandard;
        this._document = document;
        this._evaluationStatus = evaluationStatus;
        this._certificateType = certificateType;
        this._issueDate = issueDate;
    }

    get id(): number {
        return this._id;
    }

    set id(value: number) {
        this._id = value;
    }

    get issuer(): string {
        return this._issuer;
    }

    set issuer(value: string) {
        this._issuer = value;
    }

    get subject(): string {
        return this._subject;
    }

    set subject(value: string) {
        this._subject = value;
    }

    get assessmentStandard(): string {
        return this._assessmentStandard;
    }

    set assessmentStandard(value: string) {
        this._assessmentStandard = value;
    }

    get document(): CertificateDocumentInfo {
        return this._document;
    }

    set document(value: CertificateDocumentInfo) {
        this._document = value;
    }

    get evaluationStatus(): DocumentEvaluationStatus {
        return this._evaluationStatus;
    }

    set evaluationStatus(value: DocumentEvaluationStatus) {
        this._evaluationStatus = value;
    }

    get certificateType(): CertificateType {
        return this._certificateType;
    }

    set certificateType(value: CertificateType) {
        this._certificateType = value;
    }

    get issueDate(): number {
        return this._issueDate;
    }

    set issueDate(value: number) {
        this._issueDate = value;
    }
}
