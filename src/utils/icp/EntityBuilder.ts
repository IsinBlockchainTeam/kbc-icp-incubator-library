import {
    CompanyCertificate as ICPCompanyCertificate,
    CertificateTypeEnum as ICPCertificateTypeEnum,
    CertificateType as ICPCertificateType,
    DocumentInfo as ICPDocumentInfo,
    DocumentType as ICPDocumentType,
    DocumentTypeEnum as ICPDocumentTypeEnum,
    DocumentEvaluationStatusEnum as ICPDocumentEvaluationStatusEnum,
    DocumentEvaluationStatus as ICPDocumentEvaluationStatus,
    MaterialCertificate as ICPMaterialCertificate,
    ScopeCertificate as ICPScopeCertificate
} from '../../../icp/ts-canister/src/models/Certificate';
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import {
    CertificateDocument,
    CertificateType,
    DocumentEvaluationStatus,
    DocumentType
} from '../../entities/icp/Certificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';

export class EntityBuilder {
    static buildCompanyCertificate(companyCertificate: ICPCompanyCertificate): CompanyCertificate {
        return new CompanyCertificate(
            Number(companyCertificate.id),
            companyCertificate.issuer,
            companyCertificate.subject,
            companyCertificate.uploadedBy,
            companyCertificate.assessmentStandard,
            companyCertificate.assessmentAssuranceLevel,
            companyCertificate.referenceId,
            this._buildCertificateDocument(companyCertificate.document),
            this._buildDocumentEvaluationStatus(companyCertificate.evaluationStatus),
            this._buildCertificateType(companyCertificate.certType),
            new Date(Number(companyCertificate.issueDate)),
            new Date(Number(companyCertificate.validFrom)),
            new Date(Number(companyCertificate.validUntil))
        );
    }

    static buildScopeCertificate(scopeCertificate: ICPScopeCertificate): ScopeCertificate {
        return new ScopeCertificate(
            Number(scopeCertificate.id),
            scopeCertificate.issuer,
            scopeCertificate.subject,
            scopeCertificate.uploadedBy,
            scopeCertificate.assessmentStandard,
            scopeCertificate.assessmentAssuranceLevel,
            scopeCertificate.referenceId,
            this._buildCertificateDocument(scopeCertificate.document),
            this._buildDocumentEvaluationStatus(scopeCertificate.evaluationStatus),
            this._buildCertificateType(scopeCertificate.certType),
            new Date(Number(scopeCertificate.issueDate)),
            scopeCertificate.processTypes,
            new Date(Number(scopeCertificate.validFrom)),
            new Date(Number(scopeCertificate.validUntil))
        );
    }

    static buildMaterialCertificate(
        materialCertificate: ICPMaterialCertificate
    ): MaterialCertificate {
        return new MaterialCertificate(
            Number(materialCertificate.id),
            materialCertificate.issuer,
            materialCertificate.subject,
            materialCertificate.uploadedBy,
            materialCertificate.assessmentStandard,
            materialCertificate.assessmentAssuranceLevel,
            materialCertificate.referenceId,
            this._buildCertificateDocument(materialCertificate.document),
            this._buildDocumentEvaluationStatus(materialCertificate.evaluationStatus),
            this._buildCertificateType(materialCertificate.certType),
            new Date(Number(materialCertificate.issueDate)),
            Number(materialCertificate.materialId)
        );
    }

    static _buildCertificateDocumentType(documentType: ICPDocumentType): DocumentType {
        if (ICPDocumentTypeEnum.CERTIFICATE_OF_CONFORMITY in documentType)
            return DocumentType.CERTIFICATE_OF_CONFORMITY;
        if (ICPDocumentTypeEnum.COUNTRY_OF_ORIGIN in documentType)
            return DocumentType.COUNTRY_OF_ORIGIN;
        if (ICPDocumentTypeEnum.SWISS_DECODE in documentType) return DocumentType.SWISS_DECODE;
        if (ICPDocumentTypeEnum.PRODUCTION_REPORT in documentType)
            return DocumentType.PRODUCTION_REPORT;
        if (ICPDocumentTypeEnum.PRODUCTION_FACILITY_LICENSE in documentType)
            return DocumentType.PRODUCTION_FACILITY_LICENSE;
        throw new Error('Invalid document type');
    }

    static _buildDocumentEvaluationStatus(
        documentEvaluationStatus: ICPDocumentEvaluationStatus
    ): DocumentEvaluationStatus {
        if (ICPDocumentEvaluationStatusEnum.NOT_EVALUATED in documentEvaluationStatus)
            return DocumentEvaluationStatus.NOT_EVALUATED;
        if (ICPDocumentEvaluationStatusEnum.APPROVED in documentEvaluationStatus)
            return DocumentEvaluationStatus.APPROVED;
        if (ICPDocumentEvaluationStatusEnum.NOT_APPROVED in documentEvaluationStatus)
            return DocumentEvaluationStatus.NOT_APPROVED;
        throw new Error('Invalid document evaluation status');
    }

    static _buildCertificateType(certificateType: ICPCertificateType): CertificateType {
        if (ICPCertificateTypeEnum.COMPANY in certificateType) return CertificateType.COMPANY;
        if (ICPCertificateTypeEnum.SCOPE in certificateType) return CertificateType.SCOPE;
        if (ICPCertificateTypeEnum.MATERIAL in certificateType) return CertificateType.MATERIAL;
        throw new Error('Invalid certificate type');
    }

    static _buildCertificateDocument(document: ICPDocumentInfo): CertificateDocument {
        return {
            id: Number(document.id),
            documentType: this._buildCertificateDocumentType(document.docType),
            externalUrl: document.externalUrl
        };
    }
}
