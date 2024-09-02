import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { CertificateManagerDriver } from '../drivers/CertificateManagerDriver';
import { CompanyCertificate } from '../entities/CompanyCertificate';
import { ScopeCertificate } from '../entities/ScopeCertificate';
import { MaterialCertificate } from '../entities/MaterialCertificate';
import { RoleProof } from '../types/RoleProof';
import {
    BaseCertificate,
    CertificationType,
    DocumentEvaluationStatus,
    DocumentType
} from '../entities/Certificate';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { ShipmentDocumentMetadata } from './ShipmentService';
import { URL_SEGMENTS } from '../constants/ICP';
import { URLStructure } from '../types/URLStructure';

export type CertificateDocumentMetadata = {
    fileName: string;
    documentReferenceId: string;
};
export type CertificateDocument = {
    id: number;
    fileName: string;
    documentType: DocumentType;
    fileContent: Uint8Array;
    metadata?: CertificateDocumentMetadata;
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
        documentId: number,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        return this._certificateManagerDriver.registerCompanyCertificate(
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
        documentId: number,
        issueDate: Date,
        validFrom: Date,
        validUntil: Date,
        processTypes: string[]
    ): Promise<void> {
        return this._certificateManagerDriver.registerScopeCertificate(
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
        documentId: number,
        issueDate: Date,
        tradeId: number,
        lineId: number
    ): Promise<void> {
        return this._certificateManagerDriver.registerMaterialCertificate(
            roleProof,
            issuer,
            consigneeCompany,
            assessmentStandard,
            documentId,
            issueDate,
            tradeId,
            lineId
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
        tradeId: number,
        tradeLineId: number
    ): Promise<MaterialCertificate[]> {
        return this._certificateManagerDriver.getMaterialCertificates(
            roleProof,
            tradeId,
            tradeLineId
        );
    }

    async getMaterialCertificate(
        roleProof: RoleProof,
        certificateId: number
    ): Promise<MaterialCertificate> {
        return this._certificateManagerDriver.getMaterialCertificate(roleProof, certificateId);
    }

    async getDocumentIdsByConsigneeCompanyAndCertificationType(
        roleProof: RoleProof,
        consigneeCompany: string,
        certificationType: number
    ): Promise<number[]> {
        return this._certificateManagerDriver.getDocumentIdsByConsigneeCompanyAndCertificationType(
            roleProof,
            consigneeCompany,
            certificationType
        );
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

    async _addDocument(
        certificationType: CertificationType,
        certificateDocument: CertificateDocument,
        urlStructure: URLStructure,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const certTypePath = new Map<CertificationType, string>([
            [CertificationType.COMPANY, 'company'],
            [CertificationType.SCOPE, 'processType'],
            [CertificationType.MATERIAL, 'material']
        ]);
        const baseExternalUrl = `${
            FileHelpers.ensureTrailingSlash(urlStructure.prefix) +
            URL_SEGMENTS.ORGANIZATION +
            urlStructure.organizationId
        }/${URL_SEGMENTS.CERTIFICATION}${URL_SEGMENTS.FILE}`;
        await this._icpFileDriver.create(
            certificateDocument.fileContent,
            { ...resourceSpec, name: `${baseExternalUrl}${resourceSpec.name}` },
            delegatedOrganizationIds
        );
        if (certificateDocument.metadata)
            await this._icpFileDriver.create(
                FileHelpers.getBytesFromObject(certificateDocument.metadata),
                {
                    name: `${baseExternalUrl}${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                    type: 'application/json'
                },
                delegatedOrganizationIds
            );
        return this._documentDriver.registerDocument(
            roleProof,
            documentType,
            spec.name,
            contentHash.toString()
        );
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
            ) as ShipmentDocumentMetadata;
            const fileName = documentMetadata.fileName;
            const documentType = documentMetadata.documentType;

            const fileContent = await this._icpFileDriver.read(documentInfo.externalUrl);
            return {
                id: documentInfo.id,
                fileName,
                documentType,
                fileContent
            };
        } catch (e: any) {
            throw new Error(
                `Error while retrieving document file from external storage: ${e.message}`
            );
        }
    }

    async addAdmin(address: string): Promise<void> {
        return this._certificateManagerDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        return this._certificateManagerDriver.removeAdmin(address);
    }
}
