import { BaseCertificate, CertificationType, DocumentEvaluationStatus } from './Certificate';

export class MaterialCertificate extends BaseCertificate {
    private _materialId: number;

    constructor(
        id: number,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus,
        certificateType: CertificationType,
        issueDate: Date,
        materialId: number
    ) {
        super(
            id,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
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
