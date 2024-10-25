import { RoleProof } from '@kbc-lib/azle-types';
import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { CertificationManagerDriver } from '../../drivers/icp/CertificationManagerDriver';
import { BaseCertificate, CertificateDocumentType } from '../../entities/icp/Certificate';
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';
import { EvaluationStatus } from '../../entities/icp/Document';
import { Document } from './DocumentService';
import { ICPFileDriver } from '../../drivers/ICPFileDriver';
import { URL_SEGMENTS } from '../../constants/ICP';

type CertificateDocument = Document & {
    documentType: CertificateDocumentType;
};

export class CertificationManagerService {
    private readonly _certificationManagerDriver: CertificationManagerDriver;

    private readonly _icpFileDriver: ICPFileDriver;

    constructor(
        certificationManagerDriver: CertificationManagerDriver,
        icpFileDriver: ICPFileDriver
    ) {
        this._certificationManagerDriver = certificationManagerDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocument,
        validFrom: Date,
        validUntil: Date
    ): Promise<CompanyCertificate> {
        const docExternalUrl = await this._addDocument(
            URL_SEGMENTS.CERTIFICATION.COMPANY,
            document
        );
        return this._certificationManagerDriver.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            {
                documentType: document.documentType,
                externalUrl: docExternalUrl,
                metadata: {
                    filename: document.filename,
                    fileType: document.filetype
                }
            },
            validFrom,
            validUntil
        );
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocument,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ): Promise<ScopeCertificate> {
        const docExternalUrl = await this._addDocument(URL_SEGMENTS.CERTIFICATION.SCOPE, document);
        return this._certificationManagerDriver.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            {
                documentType: document.documentType,
                externalUrl: docExternalUrl,
                metadata: {
                    filename: document.filename,
                    fileType: document.filetype
                }
            },
            validFrom,
            validUntil,
            processTypes
        );
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        document: CertificateDocument,
        materialId: number
    ): Promise<MaterialCertificate> {
        const docExternalUrl = await this._addDocument(
            URL_SEGMENTS.CERTIFICATION.MATERIAL,
            document
        );
        return this._certificationManagerDriver.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            {
                documentType: document.documentType,
                externalUrl: docExternalUrl,
                metadata: {
                    filename: document.filename,
                    fileType: document.filetype
                }
            },
            materialId
        );
    }

    async getBaseCertificatesInfoBySubject(
        roleProof: RoleProof,
        subject: string
    ): Promise<BaseCertificate[]> {
        return this._certificationManagerDriver.getBaseCertificatesInfoBySubject(
            roleProof,
            subject
        );
    }

    async getCompanyCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<CompanyCertificate[]> {
        return this._certificationManagerDriver.getCompanyCertificates(roleProof, subject);
    }

    async getScopeCertificates(roleProof: RoleProof, subject: string): Promise<ScopeCertificate[]> {
        return this._certificationManagerDriver.getScopeCertificates(roleProof, subject);
    }

    async getMaterialCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<MaterialCertificate[]> {
        return this._certificationManagerDriver.getMaterialCertificates(roleProof, subject);
    }

    async getCompanyCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<CompanyCertificate> {
        return this._certificationManagerDriver.getCompanyCertificate(roleProof, subject, id);
    }

    async getScopeCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<ScopeCertificate> {
        return this._certificationManagerDriver.getScopeCertificate(roleProof, subject, id);
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        subject: string,
        id: number
    ): Promise<MaterialCertificate> {
        return this._certificationManagerDriver.getMaterialCertificate(roleProof, subject, id);
    }

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: Date,
        validUntil: Date
    ) {
        return this._certificationManagerDriver.updateCompanyCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            validFrom,
            validUntil
        );
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ) {
        return this._certificationManagerDriver.updateScopeCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            validFrom,
            validUntil,
            processTypes
        );
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        referenceId: string,
        materialId: number
    ) {
        return this._certificationManagerDriver.updateMaterialCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            referenceId,
            materialId
        );
    }

    async updateDocument(
        roleProof: RoleProof,
        certificateId: number,
        document: CertificateDocument
    ) {
        const path = document.externalUrl.split('/').slice(0, -1).join('/');

        return this._certificationManagerDriver.updateDocument(roleProof, certificateId, document);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificateId: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ) {
        return this._certificationManagerDriver.evaluateDocument(
            roleProof,
            certificateId,
            documentId,
            evaluationStatus
        );
    }

    async _addDocumentToExtStorage(
        baseExternalUrl: string,
        document: Document,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<string> {
        await this._icpFileDriver.create(
            document.fileContent,
            { ...resourceSpec, name: `${baseExternalUrl}${resourceSpec.name}` },
            delegatedOrganizationIds
        );
        return `${baseExternalUrl}${resourceSpec.name}`;
    }

    async _addDocument(relativePath: string, document: Document): Promise<string> {
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(document.storageConfig.urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            document.storageConfig.urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}${relativePath}`;
        return this._addDocumentToExtStorage(
            baseExternalUrl,
            document,
            document.storageConfig.resourceSpec,
            document.storageConfig.delegatedOrganizationIds
        );
    }
}
