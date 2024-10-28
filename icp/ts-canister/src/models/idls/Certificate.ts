import { IDL } from 'azle';
import { EvaluationStatus } from './Evaluation';

export const CertificateDocumentType = IDL.Variant({
    CERTIFICATE_OF_CONFORMITY: IDL.Null,
    COUNTRY_OF_ORIGIN: IDL.Null,
    SWISS_DECODE: IDL.Null,
    PRODUCTION_REPORT: IDL.Null,
    PRODUCTION_FACILITY_LICENSE: IDL.Null
});

export const CertificateDocumentInfo = IDL.Record({
    referenceId: IDL.Text,
    documentType: CertificateDocumentType,
    externalUrl: IDL.Text,
    metadata: IDL.Record({
        filename: IDL.Text,
        fileType: IDL.Text
    })
});

export const CertificateType = IDL.Variant({
    COMPANY: IDL.Null,
    SCOPE: IDL.Null,
    MATERIAL: IDL.Null
});

const BaseCertificateType = {
    id: IDL.Nat,
    issuer: IDL.Text,
    subject: IDL.Text,
    uploadedBy: IDL.Text,
    assessmentStandard: IDL.Text,
    assessmentAssuranceLevel: IDL.Text,
    document: CertificateDocumentInfo,
    evaluationStatus: EvaluationStatus,
    certType: CertificateType,
    issueDate: IDL.Nat,
    notes: IDL.Text
};
export const BaseCertificate = IDL.Record({
    ...BaseCertificateType
});

export const CompanyCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat
});

export const ScopeCertificate = IDL.Record({
    ...BaseCertificateType,
    validFrom: IDL.Nat,
    validUntil: IDL.Nat,
    processTypes: IDL.Vec(IDL.Text)
});

export const MaterialCertificate = IDL.Record({
    ...BaseCertificateType,
    materialId: IDL.Nat
});
