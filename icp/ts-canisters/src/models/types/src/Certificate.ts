import { EvaluationStatus } from './Evaluation';
import { DocumentMetadata } from './Document';
import { AssessmentReferenceStandard } from './AssessmentReferenceStandard';

export enum CertificateDocumentTypeEnum {
    CERTIFICATE_OF_CONFORMITY = 'CERTIFICATE_OF_CONFORMITY',
    COUNTRY_OF_ORIGIN = 'COUNTRY_OF_ORIGIN',
    SWISS_DECODE = 'SWISS_DECODE',
    PRODUCTION_REPORT = 'PRODUCTION_REPORT',
    PRODUCTION_FACILITY_LICENSE = 'PRODUCTION_FACILITY_LICENSE'
}
export type CertificateDocumentType =
    | { CERTIFICATE_OF_CONFORMITY: null }
    | { COUNTRY_OF_ORIGIN: null }
    | { SWISS_DECODE: null }
    | { PRODUCTION_REPORT: null }
    | { PRODUCTION_FACILITY_LICENSE: null };

export type CertificateDocumentInfo = {
    referenceId: string;
    documentType: CertificateDocumentType;
    externalUrl: string;
    metadata: DocumentMetadata;
};

export enum CertificateTypeEnum {
    COMPANY = 'COMPANY',
    SCOPE = 'SCOPE',
    MATERIAL = 'MATERIAL'
}
export type CertificateType = { COMPANY: null } | { SCOPE: null } | { MATERIAL: null };

export interface BaseCertificate {
    id: bigint;
    issuer: string;
    subject: string;
    uploadedBy: string;
    assessmentReferenceStandard: AssessmentReferenceStandard;
    assessmentAssuranceLevel: string;
    document: CertificateDocumentInfo;
    evaluationStatus: EvaluationStatus;
    certType: CertificateType;
    issueDate: bigint;
    notes: string;
}

export interface CompanyCertificate extends BaseCertificate {
    validFrom: bigint;
    validUntil: bigint;
}

export interface ScopeCertificate extends BaseCertificate {
    validFrom: bigint;
    validUntil: bigint;
    processTypes: string[];
}

export interface MaterialCertificate extends BaseCertificate {
    materialId: bigint;
}
