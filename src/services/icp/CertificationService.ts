import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { CertificationDriver } from '../../drivers/icp/CertificationDriver';
import {
    BaseCertificate,
    CertificateDocument,
    CertificateDocumentType
} from '../../entities/icp/Certificate';
import { CompanyCertificate } from '../../entities/icp/CompanyCertificate';
import { ScopeCertificate } from '../../entities/icp/ScopeCertificate';
import { MaterialCertificate } from '../../entities/icp/MaterialCertificate';
import { Document } from './DocumentService';
import { ICPFileDriver } from '../../drivers/ICPFileDriver';
import { URL_SEGMENTS } from '../../constants/ICP';
import { EvaluationStatus } from '../../entities/icp/Evaluation';

type CertificateDocumentRequest = Document & {
    documentType: CertificateDocumentType;
};

export class CertificationService {
    private readonly _certificationManagerDriver: CertificationDriver;

    private readonly _icpFileDriver: ICPFileDriver;

    constructor(certificationManagerDriver: CertificationDriver, icpFileDriver: ICPFileDriver) {
        this._certificationManagerDriver = certificationManagerDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async registerCompanyCertificate(
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentRequest,
        validFrom: Date,
        validUntil: Date,
        notes?: string
    ): Promise<CompanyCertificate> {
        const docExternalUrl = await this._addDocument(
            URL_SEGMENTS.CERTIFICATION.COMPANY,
            document
        );
        return this._certificationManagerDriver.registerCompanyCertificate(
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
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentRequest,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ): Promise<ScopeCertificate> {
        const docExternalUrl = await this._addDocument(URL_SEGMENTS.CERTIFICATION.SCOPE, document);
        return this._certificationManagerDriver.registerScopeCertificate(
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
        issuer: string,
        subject: string,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        document: CertificateDocumentRequest,
        materialId: number,
        notes?: string
    ): Promise<MaterialCertificate> {
        const docExternalUrl = await this._addDocument(
            URL_SEGMENTS.CERTIFICATION.MATERIAL,
            document
        );
        return this._certificationManagerDriver.registerMaterialCertificate(
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

    async getBaseCertificateById(id: number): Promise<BaseCertificate> {
        return this._certificationManagerDriver.getBaseCertificateById(id);
    }

    async getBaseCertificatesInfoBySubject(subject: string): Promise<BaseCertificate[]> {
        return this._certificationManagerDriver.getBaseCertificatesInfoBySubject(subject);
    }

    async getCompanyCertificates(subject: string): Promise<CompanyCertificate[]> {
        return this._certificationManagerDriver.getCompanyCertificates(subject);
    }

    async getScopeCertificates(subject: string): Promise<ScopeCertificate[]> {
        return this._certificationManagerDriver.getScopeCertificates(subject);
    }

    async getMaterialCertificates(subject: string): Promise<MaterialCertificate[]> {
        return this._certificationManagerDriver.getMaterialCertificates(subject);
    }

    async getCompanyCertificate(subject: string, id: number): Promise<CompanyCertificate> {
        return this._certificationManagerDriver.getCompanyCertificate(subject, id);
    }

    async getScopeCertificate(subject: string, id: number): Promise<ScopeCertificate> {
        return this._certificationManagerDriver.getScopeCertificate(subject, id);
    }

    async getMaterialCertificate(subject: string, id: number): Promise<MaterialCertificate> {
        return this._certificationManagerDriver.getMaterialCertificate(subject, id);
    }

    async updateCompanyCertificate(
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        notes?: string
    ): Promise<CompanyCertificate> {
        return this._certificationManagerDriver.updateCompanyCertificate(
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            validFrom,
            validUntil,
            notes
        );
    }

    async updateScopeCertificate(
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        notes?: string
    ): Promise<ScopeCertificate> {
        return this._certificationManagerDriver.updateScopeCertificate(
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
        certificateId: number,
        assessmentStandard: string,
        assessmentAssuranceLevel: string,
        materialId: number,
        notes?: string
    ): Promise<MaterialCertificate> {
        return this._certificationManagerDriver.updateMaterialCertificate(
            certificateId,
            assessmentStandard,
            assessmentAssuranceLevel,
            materialId,
            notes
        );
    }

    async updateDocument(
        certificateId: number,
        document: CertificateDocumentRequest
    ): Promise<BaseCertificate> {
        const baseCertificate = await this.getBaseCertificateById(certificateId);
        let externalUrl = baseCertificate.document.externalUrl;
        let metadata = baseCertificate.document.metadata;
        if (document.filename && document.filename !== baseCertificate.document.metadata.filename) {
            const path = baseCertificate.document.externalUrl.split('/').slice(0, -1).join('/');
            externalUrl = await this._addDocumentToExtStorage(
                `${path}/`,
                document,
                document.storageConfig.resourceSpec,
                document.storageConfig.delegatedOrganizationIds
            );
            metadata = {
                filename: document.filename,
                fileType: document.fileType
            };
        }

        return this._certificationManagerDriver.updateDocument(certificateId, {
            referenceId: document.referenceId,
            documentType: document.documentType,
            externalUrl,
            metadata
        });
    }

    async evaluateDocument(
        certificateId: number,
        evaluationStatus: EvaluationStatus
    ): Promise<BaseCertificate> {
        return this._certificationManagerDriver.evaluateDocument(certificateId, evaluationStatus);
    }

    async getDocument(certificateId: number): Promise<CertificateDocument> {
        const baseCertificate = await this.getBaseCertificateById(certificateId);
        const fileContent = await this._icpFileDriver.read(baseCertificate.document.externalUrl);
        return {
            ...baseCertificate.document,
            fileContent
        };
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
