import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { CertificateManagerDriver } from '../drivers/CertificateManagerDriver';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';
import { RoleProof } from '../types/RoleProof';
import {
    BaseCertificate,
    CertificateDocumentInfo,
    DocumentEvaluationStatus,
    DocumentType
} from '../entities/Certificate';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { URL_SEGMENTS } from '../constants/ICP';
import { URLStructure } from '../types/URLStructure';

type CertificateDocumentMetadata = {
    fileName: string;
    fileType: string;
    documentReferenceId: string;
};

export type CertificateDocument = {
    fileName: string;
    fileType: string;
    fileContent: Uint8Array;
};

export class CertificateManagerService {
    private _certificateManagerDriver: CertificateManagerDriver;

    private _documentDriver: DocumentDriver;

    private _icpFileDriver: ICPFileDriver;

    constructor(
        certificateManagerDriver: CertificateManagerDriver,
        documentDriver: DocumentDriver,
        icpFileDriver: ICPFileDriver
    ) {
        this._certificateManagerDriver = certificateManagerDriver;
        this._documentDriver = documentDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async registerCompanyCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        issueDate: number,
        validFrom: number,
        validUntil: number,
        documentType: DocumentType,
        documentReferenceId: string,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<[number, string]> {
        const document = await this._addDocument(
            roleProof,
            URL_SEGMENTS.CERTIFICATION.COMPANY,
            certificateDocument,
            documentType,
            documentReferenceId,
            urlStructure,
            resourceSpec,
            delegatedOrganizationIds
        );
        return this._certificateManagerDriver.registerCompanyCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            validFrom,
            validUntil
        );
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        subject: string,
        assessmentStandard: string,
        issueDate: number,
        validFrom: number,
        validUntil: number,
        processTypes: string[],
        documentType: DocumentType,
        documentReferenceId: string,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<[number, string]> {
        const document = await this._addDocument(
            roleProof,
            URL_SEGMENTS.CERTIFICATION.SCOPE,
            certificateDocument,
            documentType,
            documentReferenceId,
            urlStructure,
            resourceSpec,
            delegatedOrganizationIds
        );
        return this._certificateManagerDriver.registerScopeCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
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
        issueDate: number,
        materialId: number,
        documentType: DocumentType,
        documentReferenceId: string,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<[number, string]> {
        const document = await this._addDocument(
            roleProof,
            `${URL_SEGMENTS.CERTIFICATION.MATERIAL}${materialId}/`,
            certificateDocument,
            documentType,
            documentReferenceId,
            urlStructure,
            resourceSpec,
            delegatedOrganizationIds
        );
        return this._certificateManagerDriver.registerMaterialCertificate(
            roleProof,
            issuer,
            subject,
            assessmentStandard,
            document,
            issueDate,
            materialId
        );
    }

    async getCertificateIdsBySubject(roleProof: RoleProof, subject: string): Promise<number[]> {
        return this._certificateManagerDriver.getCertificateIdsBySubject(roleProof, subject);
    }

    async getBaseCertificatesInfoBySubject(
        roleProof: RoleProof,
        subject: string
    ): Promise<BaseCertificate[]> {
        return this._certificateManagerDriver.getBaseCertificatesInfoBySubject(roleProof, subject);
    }

    async getCompanyCertificates(
        roleProof: RoleProof,
        subject: string
    ): Promise<CompanyCertificate[]> {
        return this._certificateManagerDriver.getCompanyCertificates(roleProof, subject);
    }

    async getCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<CompanyCertificate> {
        return this._certificateManagerDriver.getCompanyCertificate(roleProof, certificateId);
    }

    async getScopeCertificates(
        roleProof: RoleProof,
        company: string,
        processType: string
    ): Promise<ScopeCertificate[]> {
        return this._certificateManagerDriver.getScopeCertificates(roleProof, company, processType);
    }

    async getScopeCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<ScopeCertificate> {
        return this._certificateManagerDriver.getScopeCertificate(roleProof, certificateId);
    }

    async getMaterialCertificates(
        roleProof: RoleProof,
        subject: string,
        materialId: number
    ): Promise<MaterialCertificate[]> {
        return this._certificateManagerDriver.getMaterialCertificates(
            roleProof,
            subject,
            materialId
        );
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<MaterialCertificate> {
        return this._certificateManagerDriver.getMaterialCertificate(roleProof, certificateId);
    }

    async updateCompanyCertificate(
        roleProof: RoleProof,
        certificateId: number,
        documentType: DocumentType,
        assessmentStandard: string,
        issueDate: number,
        validFrom: number,
        validUntil: number
    ): Promise<void> {
        return this._certificateManagerDriver.updateCompanyCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            documentType
        );
    }

    async updateScopeCertificate(
        roleProof: RoleProof,
        certificateId: number,
        documentType: DocumentType,
        assessmentStandard: string,
        issueDate: number,
        validFrom: number,
        validUntil: number,
        processTypes: string[]
    ): Promise<void> {
        return this._certificateManagerDriver.updateScopeCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            issueDate,
            validFrom,
            validUntil,
            processTypes,
            documentType
        );
    }

    async updateMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number,
        documentType: DocumentType,
        assessmentStandard: string,
        issueDate: number,
        materialId: number
    ): Promise<void> {
        return this._certificateManagerDriver.updateMaterialCertificate(
            roleProof,
            certificateId,
            assessmentStandard,
            issueDate,
            materialId,
            documentType
        );
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificateId: number,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus
    ): Promise<void> {
        return this._certificateManagerDriver.evaluateDocument(
            roleProof,
            certificateId,
            documentId,
            evaluationStatus
        );
    }

    async getBaseCertificateInfoById(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<BaseCertificate> {
        return this._certificateManagerDriver.getBaseCertificateInfoById(roleProof, certificateId);
    }

    async getDocument(roleProof: RoleProof, documentId: number): Promise<CertificateDocument> {
        try {
            const documentInfo = await this._documentDriver.getDocumentById(roleProof, documentId);
            const path = documentInfo.externalUrl.split('/').slice(0, -1).join('/');
            const metadataName = FileHelpers.removeFileExtension(
                documentInfo.externalUrl.split(`${path}/`)[1]
            );
            const documentMetadata: CertificateDocumentMetadata = FileHelpers.getObjectFromBytes(
                await this._icpFileDriver.read(`${path}/${metadataName}-metadata.json`)
            ) as CertificateDocumentMetadata;

            const fileContent = await this._icpFileDriver.read(documentInfo.externalUrl);
            return {
                fileName: documentMetadata.fileName,
                fileType: documentMetadata.fileType,
                fileContent
            };
        } catch (e: any) {
            throw new Error(
                `Error while retrieving document file from external storage: ${e.message}`
            );
        }
    }

    async updateDocument(
        roleProof: RoleProof,
        certificationId: number,
        documentId: number,
        certificateDocument: CertificateDocument,
        documentReferenceId: string,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const documentInfo = await this._documentDriver.getDocumentById(roleProof, documentId);
        const path = documentInfo.externalUrl.split('/').slice(0, -1).join('/');
        const externalUrl = await this._addDocumentToExtStorage(
            `${path}/`,
            certificateDocument,
            documentReferenceId,
            resourceSpec,
            delegatedOrganizationIds
        );
        await this._certificateManagerDriver.updateDocument(
            roleProof,
            certificationId,
            documentId,
            externalUrl,
            FileHelpers.getHash(certificateDocument.fileContent).toString()
        );
    }

    async addAdmin(address: string): Promise<void> {
        return this._certificateManagerDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        return this._certificateManagerDriver.removeAdmin(address);
    }

    async _addDocumentToExtStorage(
        baseExternalUrl: string,
        certificateDocument: CertificateDocument,
        documentReferenceId: string,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<string> {
        await this._icpFileDriver.create(
            certificateDocument.fileContent,
            { ...resourceSpec, name: `${baseExternalUrl}${resourceSpec.name}` },
            delegatedOrganizationIds
        );
        const metadata: CertificateDocumentMetadata = {
            fileName: certificateDocument.fileName,
            fileType: certificateDocument.fileType,
            documentReferenceId
        };
        await this._icpFileDriver.create(
            FileHelpers.getBytesFromObject(metadata),
            {
                name: `${baseExternalUrl}${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        return `${baseExternalUrl}${resourceSpec.name}`;
    }

    async _addDocument(
        roleProof: RoleProof,
        relativePath: string,
        certificateDocument: CertificateDocument,
        documentType: DocumentType,
        documentReferenceId: string,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<CertificateDocumentInfo> {
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}${relativePath}`;
        const externalUrl = await this._addDocumentToExtStorage(
            baseExternalUrl,
            certificateDocument,
            documentReferenceId,
            resourceSpec,
            delegatedOrganizationIds
        );
        return {
            id: await this._documentDriver.registerDocument(
                roleProof,
                externalUrl,
                FileHelpers.getHash(certificateDocument.fileContent).toString()
            ),
            documentType
        };
    }
}
