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

export class CertificationService {
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
        document: CertificateDocument,
        validFrom: Date,
        validUntil: Date,
        notes?: string
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
            {
                referenceId: document.referenceId,
                documentType: document.documentType,
                externalUrl: docExternalUrl,
                metadata: {
                    filename: document.filename,
                    fileType: document.fileType
                }
            },
            validFrom,
            validUntil,
            notes
        );
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocument,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ): Promise<ScopeCertificate> {
        console.log('issuer: ', issuer);
        console.log('subject: ', subject);
        console.log('assessmentStandard: ', assessmentStandard);
        console.log('assessmentAssuranceLevel: ', assessmentAssuranceLevel);
        console.log('document: ', document);
        console.log('validFrom: ', validFrom);
        console.log('validUntil: ', validUntil);
        console.log('processTypes: ', processTypes);
        const docExternalUrl = await this._addDocument(URL_SEGMENTS.CERTIFICATION.SCOPE, document);
        console.log('docExternalUrl: ', docExternalUrl);
        console.log('notes: ', notes || '');
        return this._certificationManagerDriver.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            assessmentAssuranceLevel,
            {
                referenceId: document.referenceId,
                documentType: document.documentType,
                externalUrl: docExternalUrl,
                metadata: {
                    filename: document.filename,
                    fileType: document.fileType
                }
            },
            validFrom,
            validUntil,
            processTypes,
            notes
        );
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocument,
        materialId: number,
        notes?: string
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
            {
                referenceId: document.referenceId,
                documentType: document.documentType,
                externalUrl: docExternalUrl,
                metadata: {
                    filename: document.filename,
                    fileType: document.fileType
                }
            },
            materialId,
            notes
        );
    }

    async getBaseCertificateById(roleProof: RoleProof, id: number): Promise<BaseCertificate> {
        return this._certificationManagerDriver.getBaseCertificateById(roleProof, id);
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
        validFrom: Date,
        validUntil: Date,
        notes?: string
    ) {
        return this._certificationManagerDriver.updateCompanyCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            notes
        );
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ) {
        return this._certificationManagerDriver.updateScopeCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            processTypes,
            notes
        );
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        materialId: number,
        notes?: string
    ) {
        return this._certificationManagerDriver.updateMaterialCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            materialId,
            notes
        );
    }

    async updateDocument(
        roleProof: RoleProof,
        certificateId: number,
        document: CertificateDocument
    ) {
        const baseCertificate = await this.getBaseCertificateById(roleProof, certificateId);
        const path = baseCertificate.document.externalUrl.split('/').slice(0, -1).join('/');
        const externalUrl = await this._addDocumentToExtStorage(
            `${path}/`,
            document,
            document.storageConfig.resourceSpec,
            document.storageConfig.delegatedOrganizationIds
        );

        return this._certificationManagerDriver.updateDocument(roleProof, certificateId, {
            referenceId: document.referenceId,
            documentType: document.documentType,
            externalUrl,
            metadata: {
                filename: document.filename,
                fileType: document.fileType
            }
        });
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
