export enum CertificationType {
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

export class BaseCertificate {
    private _id: number;

    private _issuer: string;

    private _consigneeCompany: string;

    private _assessmentStandard: string;

    private _documentId: number;

    private _evaluationStatus: DocumentEvaluationStatus;

    private _certificateType: CertificationType;

    private _issueDate: Date;

    constructor(
        id: number,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificationType,
        issueDate: Date
    ) {
        this._id = id;
        this._issuer = issuer;
        this._consigneeCompany = consigneeCompany;
        this._assessmentStandard = assessmentStandard;
        this._documentId = documentId;
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

    get documentId(): number {
        return this._documentId;
    }

    set documentId(value: number) {
        this._documentId = value;
    }

    get evaluationStatus(): DocumentEvaluationStatus {
        return this._evaluationStatus;
    }

    set evaluationStatus(value: DocumentEvaluationStatus) {
        this._evaluationStatus = value;
    }

    get certificateType(): CertificationType {
        return this._certificateType;
    }

    set certificateType(value: CertificationType) {
        this._certificateType = value;
    }

    get issueDate(): Date {
        return this._issueDate;
    }

    set issueDate(value: Date) {
        this._issueDate = value;
    }
}
