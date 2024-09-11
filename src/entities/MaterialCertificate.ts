import {
    BaseCertificate,
    CertificateDocumentInfo,
    CertificateType,
    DocumentEvaluationStatus
} from './Certificate';

export class MaterialCertificate extends BaseCertificate {
    private _materialId: number;

    constructor(
        id: number,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        document: CertificateDocumentInfo,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificateType,
        issueDate: Date,
        materialId: number
    ) {
        super(
            id,
            issuer,
            consigneeCompany,
            assessmentStandard,
            document,
            evaluationStatus,
            certificateType,
            issueDate
        );
        this._materialId = materialId;
    }

    get materialId(): number {
        return this._materialId;
    }

    set materialId(value: number) {
        this._materialId = value;
    }
}
