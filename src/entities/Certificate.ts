import { EvaluationStatus } from './Evaluation';
import { AssessmentReferenceStandard } from './AssessmentReferenceStandard';

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

export type DocumentMetadata = {
    filename: string;
    fileType: string;
};

export type CertificateDocumentInfo = {
    referenceId: string;
    documentType: CertificateDocumentType;
    externalUrl: string;
    metadata: DocumentMetadata;
};
export type CertificateDocument = CertificateDocumentInfo & {
    fileContent: Uint8Array;
};

export class BaseCertificate {
    private _id: number;

    private _issuer: string;

    private _subject: string;

    private _uploadedBy: string;

    private _assessmentReferenceStandard: AssessmentReferenceStandard;

    private _assessmentAssuranceLevel: string;

    private _document: CertificateDocumentInfo;

    private _evaluationStatus: EvaluationStatus;

    private _certificateType: CertificateType;

    private _issueDate: Date;

    private _notes?: string;

    constructor(
        id: number,
        issuer: string,
        subject: string,
        uploadedBy: string,
        assessmentReferenceStandard: AssessmentReferenceStandard,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentInfo,
        evaluationStatus: EvaluationStatus,
        certificateType: CertificateType,
        issueDate: Date,
        notes?: string
    ) {
        this._id = id;
        this._issuer = issuer;
        this._subject = subject;
        this._uploadedBy = uploadedBy;
        this._assessmentReferenceStandard = assessmentReferenceStandard;
        this._assessmentAssuranceLevel = assessmentAssuranceLevel;
        this._document = document;
        this._evaluationStatus = evaluationStatus;
        this._certificateType = certificateType;
        this._issueDate = issueDate;
        this._notes = notes;
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

    get assessmentReferenceStandard(): AssessmentReferenceStandard {
        return this._assessmentReferenceStandard;
    }

    set assessmentReferenceStandard(value: AssessmentReferenceStandard) {
        this._assessmentReferenceStandard = value;
    }

    get assessmentAssuranceLevel(): string {
        return this._assessmentAssuranceLevel;
    }

    set assessmentAssuranceLevel(value: string) {
        this._assessmentAssuranceLevel = value;
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

    get notes(): string | undefined {
        return this._notes;
    }

    set notes(value: string | undefined) {
        this._notes = value;
    }
}
