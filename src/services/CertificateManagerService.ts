import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { CertificateManagerDriver } from '../drivers/CertificateManagerDriver';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';
import { RoleProof } from '../types/RoleProof';
import { BaseCertificate, DocumentEvaluationStatus, DocumentType } from '../entities/Certificate';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { URL_SEGMENTS } from '../constants/ICP';
import { URLStructure } from '../types/URLStructure';

type CertificateDocumentMetadata = {
    fileName: string;
    documentType: DocumentType;
    documentReferenceId: string;
};

export type CertificateDocument = {
    fileName: string;
    documentType: DocumentType;
    fileContent: Uint8Array;
    documentReferenceId: string;
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
        consigneeCompany: string,
        assessmentStandard: string,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const documentId = await this._addDocument(
            roleProof,
            URL_SEGMENTS.CERTIFICATION.COMPANY,
            certificateDocument,
            urlStructure,
            resourceSpec,
            delegatedOrganizationIds
        );
        await this._certificateManagerDriver.registerCompanyCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate,
            validFrom,
            validUntil
        );
    }

    async registerScopeCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[],
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const documentId = await this._addDocument(
            roleProof,
            URL_SEGMENTS.CERTIFICATION.SCOPE,
            certificateDocument,
            urlStructure,
            resourceSpec,
            delegatedOrganizationIds
        );
        await this._certificateManagerDriver.registerScopeCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate,
            validFrom,
            validUntil,
            processTypes
        );
    }

    async registerMaterialCertificate(
        roleProof: RoleProof,
        issuer: string,
        consigneeCompany: string,
        assessmentStandard: string,
        issueDate: Date,
        materialId: number,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const documentId = await this._addDocument(
            roleProof,
            `${URL_SEGMENTS.CERTIFICATION.MATERIAL}/${materialId}`,
            certificateDocument,
            urlStructure,
            resourceSpec,
            delegatedOrganizationIds
        );
        await this._certificateManagerDriver.registerMaterialCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate,
            materialId
        );
    }

    async getCertificateIdsByConsigneeCompany(
        roleProof: RoleProof,
        consigneeCompany: string
    ): Promise<number[]> {
        return this._certificateManagerDriver.getCertificateIdsByConsigneeCompany(
            roleProof,
            consigneeCompany
        );
    }

    async getCompanyCertificates(
        roleProof: RoleProof,
        consigneeCompany: string
    ): Promise<CompanyCertificate[]> {
        return this._certificateManagerDriver.getCompanyCertificates(roleProof, consigneeCompany);
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
        consigneeCompany: string,
        materialId: number
    ): Promise<MaterialCertificate[]> {
        return this._certificateManagerDriver.getMaterialCertificates(
            roleProof,
            consigneeCompany,
            materialId
        );
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<MaterialCertificate> {
        return this._certificateManagerDriver.getMaterialCertificate(roleProof, certificateId);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        certificationId: number,
        documentId: number,
        evaluationStatus: DocumentEvaluationStatus
    ): Promise<void> {
        return this._certificateManagerDriver.evaluateDocument(
            roleProof,
            certificationId,
            documentId,
            evaluationStatus
        );
    }

    async getBaseCertificateById(
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
                documentType: documentMetadata.documentType,
                fileContent,
                documentReferenceId: documentMetadata.documentReferenceId
            };
        } catch (e: any) {
            throw new Error(
                `Error while retrieving document file from external storage: ${e.message}`
            );
        }
    }

    async updateDocument(
        roleProof: RoleProof,
        documentId: number,
        certificateDocument: CertificateDocument,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const documentInfo = await this._documentDriver.getDocumentById(roleProof, documentId);
        const path = documentInfo.externalUrl.split('/').slice(0, -1).join('/');
        const externalUrl = await this._addDocumentToExtStorage(
            path,
            certificateDocument,
            resourceSpec,
            delegatedOrganizationIds
        );
        await this._certificateManagerDriver.updateDocument(
            roleProof,
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
            documentType: certificateDocument.documentType,
            documentReferenceId: certificateDocument.documentReferenceId
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
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<number> {
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION.BASE}${URL_SEGMENTS.FILE}${relativePath}`;
        const externalUrl = await this._addDocumentToExtStorage(
            baseExternalUrl,
            certificateDocument,
            resourceSpec,
            delegatedOrganizationIds
        );
        return this._certificateManagerDriver.addDocument(
            roleProof,
            certificateDocument.documentType,
            externalUrl,
            FileHelpers.getHash(certificateDocument.fileContent).toString()
        );
    }
}
