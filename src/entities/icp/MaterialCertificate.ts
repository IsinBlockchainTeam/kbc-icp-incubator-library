import { BaseCertificate, CertificateDocumentInfo, CertificateType } from './Certificate';
import { EvaluationStatus } from './Document';

export class MaterialCertificate extends BaseCertificate {
    private _materialId: number;

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
        materialId: number
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
        this._materialId = materialId;
    }

    get materialId(): number {
        return this._materialId;
    }

    set materialId(value: number) {
        this._materialId = value;
    }
}
