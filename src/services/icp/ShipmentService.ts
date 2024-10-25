import { ShipmentDriver } from '../../drivers/icp/ShipmentDriver';
import { RoleProof } from '@kbc-lib/azle-types';
import { Shipment, Phase } from '../../entities/icp/Shipment';
import { DocumentType, DocumentInfo } from '../../entities/icp/Document';
import { EvaluationStatus } from '../../entities/icp/Evaluation';
import { ICPFileDriver } from '../../drivers/ICPFileDriver';
import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { URL_SEGMENTS } from '../../constants/ICP';

export type ShipmentPhaseDocument = {
    documentType: DocumentType;
    required: boolean;
};
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
    private readonly _shipmentDriver: ShipmentDriver;

    private readonly _icpFileDriver: ICPFileDriver;

    constructor(shipmentDriver: ShipmentDriver, icpFileDriver: ICPFileDriver) {
        this._shipmentDriver = shipmentDriver;
        this._icpFileDriver = icpFileDriver;
    }

    async getShipments(roleProof: RoleProof): Promise<Shipment[]> {
        return this._shipmentDriver.getShipments(roleProof);
    }

    async getShipment(roleProof: RoleProof, id: number): Promise<Shipment> {
        return this._shipmentDriver.getShipment(roleProof, id);
    }

    async getShipmentPhase(roleProof: RoleProof, id: number): Promise<Phase> {
        return this._shipmentDriver.getShipmentPhase(roleProof, id);
    }

    async getDocumentsByType(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType
    ): Promise<DocumentInfo[]> {
        return this._shipmentDriver.getDocumentsByType(roleProof, id, documentType);
    }

    async setShipmentDetails(
        roleProof: RoleProof,
        id: number,
        shipmentNumber: number,
        expirationDate: number,
        fixingDate: number,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ): Promise<Shipment> {
        return this._shipmentDriver.setShipmentDetails(
            roleProof,
            id,
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

    async evaluateSample(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateSample(roleProof, id, evaluationStatus);
    }

    async evaluateShipmentDetails(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateShipmentDetails(roleProof, id, evaluationStatus);
    }

    async evaluateQuality(
        roleProof: RoleProof,
        id: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateQuality(roleProof, id, evaluationStatus);
    }

    async depositFunds(roleProof: RoleProof, id: number, amount: number): Promise<Shipment> {
        return this._shipmentDriver.depositFunds(roleProof, id, amount);
    }

    async lockFunds(roleProof: RoleProof, id: number): Promise<Shipment> {
        return this._shipmentDriver.lockFunds(roleProof, id);
    }

    async unlockFunds(roleProof: RoleProof, id: number): Promise<Shipment> {
        return this._shipmentDriver.unlockFunds(roleProof, id);
    }

    private async retrieveDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number
    ): Promise<ShipmentDocument> {
        try {
            const shipment = await this._shipmentDriver.getShipment(roleProof, id);
            let documentInfo;
            for (const [, documentInfos] of shipment.documents.entries()) {
                for (const info of documentInfos) {
                    if (info.id === documentId) {
                        documentInfo = info;
                        break;
                    }
                }
            }
            if (!documentInfo) {
                throw new Error('Document not found');
            }

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

    async getDocuments(
        roleProof: RoleProof,
        id: number
    ): Promise<Map<DocumentType, ShipmentDocument[]>> {
        const unresolvedDocuments = await this._shipmentDriver.getDocuments(roleProof, id);
        const resolvedDocuments = new Map<DocumentType, ShipmentDocument[]>();
        for (const [documentType, documentInfos] of unresolvedDocuments.entries()) {
            const resolved: ShipmentDocument[] = [];
            for (const info of documentInfos) {
                resolved.push(await this.retrieveDocument(roleProof, id, info.id));
            }
            resolvedDocuments.set(documentType, resolved);
        }
        return resolvedDocuments;
    }

    async addDocument(
        roleProof: RoleProof,
        id: number,
        documentType: DocumentType,
        documentReferenceId: string,
        fileContent: Uint8Array,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<Shipment> {
        // TODO: update with storage principal id
        const externalUrl = `https://<storage_principal_id>.localhost:4943/organization/0/transactions/${id}/files`;

        const fileName = FileHelpers.removeFileExtension(resourceSpec.name);
        const spec = { ...resourceSpec };
        spec.name = `${externalUrl}/${URL_SEGMENTS.FILE}${spec.name}`;
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
                name: `${externalUrl}/${URL_SEGMENTS.FILE}${fileName}-metadata.json`,
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        return this._shipmentDriver.addDocument(roleProof, id, documentType, externalUrl);
    }

    async updateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        externalUrl: string
    ): Promise<Shipment> {
        return this._shipmentDriver.updateDocument(roleProof, id, documentId, externalUrl);
    }

    async evaluateDocument(
        roleProof: RoleProof,
        id: number,
        documentId: number,
        evaluationStatus: EvaluationStatus
    ): Promise<Shipment> {
        return this._shipmentDriver.evaluateDocument(roleProof, id, documentId, evaluationStatus);
    }

    async getPhase1Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase1Documents();
    }

    async getPhase1RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase1RequiredDocuments();
    }

    async getPhase2Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase2Documents();
    }

    async getPhase2RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase2RequiredDocuments();
    }

    async getPhase3Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase3Documents();
    }

    async getPhase3RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase3RequiredDocuments();
    }

    async getPhase4Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase4Documents();
    }

    async getPhase4RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase4RequiredDocuments();
    }

    async getPhase5Documents(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase5Documents();
    }

    async getPhase5RequiredDocuments(): Promise<DocumentType[]> {
        return this._shipmentDriver.getPhase5RequiredDocuments();
    }
}
