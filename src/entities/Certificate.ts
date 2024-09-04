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

    private _consigneeCompany: string;

    private _assessmentStandard: string;

    private _document: CertificateDocumentInfo;

    private _evaluationStatus: DocumentEvaluationStatus;

    private _certificateType: CertificateType;

    private _issueDate: Date;

    constructor(
        id: number,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificateType,
        issueDate: Date
    ) {
        this._id = id;
        this._issuer = issuer;
        this._consigneeCompany = consigneeCompany;
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

    get consigneeCompany(): string {
        return this._consigneeCompany;
    }

    set consigneeCompany(value: string) {
        this._consigneeCompany = value;
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

    get issueDate(): Date {
        return this._issueDate;
    }

    set issueDate(value: Date) {
        this._issueDate = value;
    }
}
