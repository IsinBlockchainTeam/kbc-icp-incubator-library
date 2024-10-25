import { DocumentMetadata, EvaluationStatus } from './Document';

export enum CertificateType {
    COMPANY = 'COMPANY',
    SCOPE = 'SCOPE',
    MATERIAL = 'MATERIAL'
}

export enum CertificateDocumentType {
    CERTIFICATE_OF_CONFORMITY = 'CERTIFICATE_OF_CONFORMITY',
    COUNTRY_OF_ORIGIN = 'COUNTRY_OF_ORIGIN',
    SWISS_DECODE = 'SWISS_DECODE',
    PRODUCTION_REPORT = 'PRODUCTION_REPORT',
    PRODUCTION_FACILITY_LICENSE = 'PRODUCTION_FACILITY_LICENSE'
}

export type CertificateDocumentInfo = {
    documentType: CertificateDocumentType;
    externalUrl: string;
    metadata: DocumentMetadata;
};

export class BaseCertificate {
    private _id: number;

    private _issuer: string;

    private _subject: string;

    private _uploadedBy: string;

    private _assessmentStandard: string;

    private _assessmentAssuranceLevel: string;

    private _referenceId: string;

    private _document: CertificateDocumentInfo;

    private _evaluationStatus: EvaluationStatus;

    private _certificateType: CertificateType;

    private _issueDate: Date;

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
        issueDate: Date
    ) {
        this._id = id;
        this._issuer = issuer;
        this._subject = subject;
        this._uploadedBy = uploadedBy;
        this._assessmentStandard = assessmentStandard;
        this._assessmentAssuranceLevel = assessmentAssuranceLevel;
        this._referenceId = referenceId;
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

    get uploadedBy(): string {
        return this._uploadedBy;
    }

    set uploadedBy(value: string) {
        this._uploadedBy = value;
    }

    get assessmentStandard(): string {
        return this._assessmentStandard;
    }

    set assessmentStandard(value: string) {
        this._assessmentStandard = value;
    }

    get assessmentAssuranceLevel(): string {
        return this._assessmentAssuranceLevel;
    }

    set assessmentAssuranceLevel(value: string) {
        this._assessmentAssuranceLevel = value;
    }

    get referenceId(): string {
        return this._referenceId;
    }

    set referenceId(value: string) {
        this._referenceId = value;
    }

    get document(): CertificateDocumentInfo {
        return this._document;
    }

    set document(value: CertificateDocumentInfo) {
        this._document = value;
    }

    get evaluationStatus(): EvaluationStatus {
        return this._evaluationStatus;
    }

    set evaluationStatus(value: EvaluationStatus) {
        this._evaluationStatus = value;
    }

    get certificateType(): CertificateType {
        return this._certificateType;
    }

    set certificateType(value: CertificateType) {
        this._certificateType = value;
    }

    get issueDate(): Date {
        return this._issueDate;
    }

    set issueDate(value: Date) {
        this._issueDate = value;
    }
}
