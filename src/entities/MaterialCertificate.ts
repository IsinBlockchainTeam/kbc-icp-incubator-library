import { BaseCertificate, CertificateDocumentInfo, CertificateType } from './Certificate';
import { EvaluationStatus } from './Evaluation';
import { Material } from './Material';
import { AssessmentReferenceStandard } from './AssessmentReferenceStandard';

export class MaterialCertificate extends BaseCertificate {
    private _material: Material;

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
        material: Material,
        notes?: string
    ) {
        super(
            id,
            issuer,
            subject,
            uploadedBy,
            assessmentReferenceStandard,
            assessmentAssuranceLevel,
            document,
            evaluationStatus,
            certificateType,
            issueDate,
            notes
        );
        this._material = material;
    }

    get material(): Material {
        return this._material;
    }

    set material(value: Material) {
        this._material = value;
    }
}
