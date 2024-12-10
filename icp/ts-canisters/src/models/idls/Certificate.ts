import { IDL } from 'azle';
import { IDLEvaluationStatus } from './Evaluation';
import { IDLAssessmentReferenceStandard } from './AssessmentReferenceStandard';

export const IDLCertificateDocumentType = IDL.Variant({
    CERTIFICATE_OF_CONFORMITY: IDL.Null,
    COUNTRY_OF_ORIGIN: IDL.Null,
    SWISS_DECODE: IDL.Null,
    PRODUCTION_REPORT: IDL.Null,
    PRODUCTION_FACILITY_LICENSE: IDL.Null
});

export const IDLCertificateDocumentInfo = IDL.Record({
    referenceId: IDL.Text,
    documentType: IDLCertificateDocumentType,
    externalUrl: IDL.Text,
    metadata: IDL.Record({
        filename: IDL.Text,
        fileType: IDL.Text
    })
});

export const IDLCertificateType = IDL.Variant({
    COMPANY: IDL.Null,
    SCOPE: IDL.Null,
    MATERIAL: IDL.Null
});

const BaseCertificateType = {
    id: IDL.Nat,
    issuer: IDL.Text,
    subject: IDL.Text,
    uploadedBy: IDL.Text,
    assessmentReferenceStandard: IDLAssessmentReferenceStandard,
    assessmentAssuranceLevel: IDL.Text,
    document: IDLCertificateDocumentInfo,
    evaluationStatus: IDLEvaluationStatus,
    certType: IDLCertificateType,
    issueDate: IDL.Nat,
    notes: IDL.Text
};
export const IDLBaseCertificate = IDL.Record({
    ...BaseCertificateType
});

export const IDLCompanyCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat
});

export const IDLScopeCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat,
    processTypes: IDL.Vec(IDL.Text)
});

export const IDLMaterialCertificate = IDL.Record({
    ...BaseCertificateType,
    materialId: IDL.Nat
});
