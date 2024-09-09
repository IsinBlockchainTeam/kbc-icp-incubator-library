import {FileHelpers, ICPResourceSpec} from '@blockchain-lib/common';
import {ShipmentDriver} from '../drivers/ShipmentDriver';
import {
    DocumentEvaluationStatus,
    DocumentInfo,
    DocumentType,
    EvaluationStatus, Phase,
    Shipment,
} from '../entities/Shipment';
import {DocumentDriver} from '../drivers/DocumentDriver';
import {ICPFileDriver} from '../drivers/ICPFileDriver';
import {RoleProof} from '../types/RoleProof';

export type ShipmentPhaseDocument = {
    documentType: DocumentType;
    required: boolean;
}
export type ShipmentDocument = {
    id: number;
    fileName: string;
    documentType: DocumentType;
    fileContent: Uint8Array;
};
export type ShipmentDocumentMetadata = {
    fileName: string;
    documentType: DocumentType;
    date: Date;
    documentReferenceId: string;
};
export class ShipmentService {
    private _shipmentManagerDriver: ShipmentDriver;

    private _documentDriver: DocumentDriver;

    private _icpFileDriver: ICPFileDriver;

    constructor(
        shipmentManagerDriver: ShipmentDriver,
        documentDriver: DocumentDriver,
        icpFileDriver: ICPFileDriver
    ) {
        this._shipmentManagerDriver = shipmentManagerDriver;
        this._documentDriver = documentDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async getShipment(roleProof: RoleProof): Promise<Shipment> {
        return this._shipmentManagerDriver.getShipment(roleProof);
    }

    async getPhase(roleProof: RoleProof): Promise<Phase> {
        return this._shipmentManagerDriver.getPhase(roleProof);
    }

    async getDocumentId(roleProof: RoleProof, documentType: DocumentType): Promise<number> {
        if(documentType === DocumentType.GENERIC) {
            throw new Error('Document type must be different from GENERIC');
        }
        return (await this._shipmentManagerDriver.getDocumentsIds(roleProof, documentType))[0];
    }

    async getGenericDocumentsIds(roleProof: RoleProof): Promise<number[]> {
        return this._shipmentManagerDriver.getDocumentsIds(roleProof, DocumentType.GENERIC);
    }

    async getDocumentInfo(roleProof: RoleProof, documentId: number): Promise<DocumentInfo | null> {
        return this._shipmentManagerDriver.getDocumentInfo(roleProof, documentId);
    }

    async setDetails(roleProof: RoleProof, shipmentNumber: number, expirationDate: Date, fixingDate: Date, targetExchange: string, differentialApplied: number, price: number, quantity: number, containersNumber: number, netWeight: number, grossWeight: number): Promise<void> {
        return this._shipmentManagerDriver.setDetails(
            roleProof,
            shipmentNumber,
            expirationDate,
            fixingDate,
            targetExchange,
            differentialApplied,
            price,
            quantity,
            containersNumber,
            netWeight,
            grossWeight
        );
    }

    async approveSample(roleProof: RoleProof): Promise<void> {
        return this._shipmentManagerDriver.evaluateSample(roleProof, EvaluationStatus.APPROVED);
    }

    async rejectSample(roleProof: RoleProof): Promise<void> {
        return this._shipmentManagerDriver.evaluateSample(roleProof, EvaluationStatus.NOT_APPROVED);
    }

    async approveDetails(roleProof: RoleProof): Promise<void> {
        return this._shipmentManagerDriver.evaluateDetails(roleProof, EvaluationStatus.APPROVED);
    }

    async rejectDetails(roleProof: RoleProof): Promise<void> {
        return this._shipmentManagerDriver.evaluateDetails(roleProof, EvaluationStatus.NOT_APPROVED);
    }

    async approveQuality(roleProof: RoleProof): Promise<void> {
        return this._shipmentManagerDriver.evaluateQuality(roleProof, EvaluationStatus.APPROVED);
    }

    async rejectQuality(roleProof: RoleProof): Promise<void> {
        return this._shipmentManagerDriver.evaluateQuality(roleProof, EvaluationStatus.NOT_APPROVED);
    }

    async depositFunds(roleProof: RoleProof, amount: number): Promise<void> {
        return this._shipmentManagerDriver.depositFunds(roleProof, amount);
    }

    async addDocument(
        roleProof: RoleProof,
        documentType: DocumentType,
        documentReferenceId: string,
        fileContent: Uint8Array,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const shipmentExternalUrl = (await this.getShipment(roleProof)).externalUrl;
        const fileName = FileHelpers.removeFileExtension(resourceSpec.name);
        const spec = { ...resourceSpec };
        spec.name = `${shipmentExternalUrl}/files/${spec.name}`;
        const contentHash = FileHelpers.getHash(fileContent);
        await this._icpFileDriver.create(fileContent, spec, delegatedOrganizationIds);
        const documentMetadata: ShipmentDocumentMetadata = {
            fileName: spec.name,
            documentReferenceId,
            documentType,
            date: new Date()
        };
        await this._icpFileDriver.create(
            FileHelpers.getBytesFromObject(documentMetadata),
            {
                name: `${shipmentExternalUrl}/files/${fileName}-metadata.json`,
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        return this._shipmentManagerDriver.addDocument(
            roleProof,
            documentType,
            spec.name,
            contentHash.toString()
        );
    }

    async getDocument(roleProof: RoleProof, documentId: number): Promise<ShipmentDocument> {
        try {
            const documentInfo = await this._documentDriver.getDocumentById(roleProof, documentId);
            const path = documentInfo.externalUrl.split('/').slice(0, -1).join('/');
            const metadataName = FileHelpers.removeFileExtension(
                documentInfo.externalUrl.split(`${path}/`)[1]
            );
            const documentMetadata: ShipmentDocumentMetadata = FileHelpers.getObjectFromBytes(
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

    async approveDocument(roleProof: RoleProof, documentId: number): Promise<void> {
        return this._shipmentManagerDriver.evaluateDocument(roleProof, documentId, DocumentEvaluationStatus.APPROVED);
    }

    async rejectDocument(roleProof: RoleProof, documentId: number): Promise<void> {
        return this._shipmentManagerDriver.evaluateDocument(roleProof, documentId, DocumentEvaluationStatus.NOT_APPROVED);
    }

    async getPhaseDocuments(phase: Phase): Promise<ShipmentPhaseDocument[]> {
        const documents = await this._shipmentManagerDriver.getUploadableDocuments(phase);
        const requiredDocuments = await this._shipmentManagerDriver.getRequiredDocuments(phase);
        return documents.map((documentType) => ({
            documentType,
            required: requiredDocuments.includes(documentType)
        }));
    }
}
