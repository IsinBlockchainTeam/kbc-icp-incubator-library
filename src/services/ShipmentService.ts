import { ShipmentDriver } from '../drivers/ShipmentDriver';
import { Shipment, Phase } from '../entities/Shipment';
import { DocumentType, DocumentInfo } from '../entities/Document';
import { EvaluationStatus } from '../entities/Evaluation';
import { FileDriver } from '../drivers/FileDriver';
import { URL_SEGMENTS } from '../constants/ICP';
import FileHelpers from '../utils/FileHelpers';
import { ResourceSpec } from '../types/ResourceSpec';

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

    private readonly _icpFileDriver: FileDriver;

    private readonly _baseExternalUrl?: string;

    constructor(
        shipmentDriver: ShipmentDriver,
        icpFileDriver: FileDriver,
        baseExternalUrl?: string
    ) {
        this._shipmentDriver = shipmentDriver;
        this._icpFileDriver = icpFileDriver;
        this._baseExternalUrl = baseExternalUrl;
    }

    async getShipments(): Promise<Shipment[]> {
        return this._shipmentDriver.getShipments();
    }

    async getShipment(id: number): Promise<Shipment> {
        return this._shipmentDriver.getShipment(id);
    }

    async getShipmentPhase(id: number): Promise<Phase> {
        return this._shipmentDriver.getShipmentPhase(id);
    }

    async getDocumentsByType(id: number, documentType: DocumentType): Promise<DocumentInfo[]> {
        return this._shipmentDriver.getDocumentsByType(id, documentType);
    }

    async setShipmentDetails(
        id: number,
        shipmentNumber: number,
        expirationDate: Date,
        fixingDate: Date,
        targetExchange: string,
        differentialApplied: number,
        price: number,
        quantity: number,
        containersNumber: number,
        netWeight: number,
        grossWeight: number
    ): Promise<Shipment> {
        return this._shipmentDriver.setShipmentDetails(
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

    async approveSample(id: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateSample(id, EvaluationStatus.APPROVED);
    }

    async rejectSample(id: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateSample(id, EvaluationStatus.NOT_APPROVED);
    }

    async approveShipmentDetails(id: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateShipmentDetails(id, EvaluationStatus.APPROVED);
    }

    async rejectShipmentDetails(id: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateShipmentDetails(id, EvaluationStatus.NOT_APPROVED);
    }

    async approveQuality(id: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateQuality(id, EvaluationStatus.APPROVED);
    }

    async rejectQuality(id: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateQuality(id, EvaluationStatus.NOT_APPROVED);
    }

    async determineDownPaymentAddress(id: number): Promise<Shipment> {
        return this._shipmentDriver.determineDownPaymentAddress(id);
    }

    async depositFunds(id: number, amount: number): Promise<Shipment> {
        return this._shipmentDriver.depositFunds(id, amount);
    }

    async lockFunds(id: number): Promise<Shipment> {
        return this._shipmentDriver.lockFunds(id);
    }

    async unlockFunds(id: number): Promise<Shipment> {
        return this._shipmentDriver.unlockFunds(id);
    }

    private async retrieveDocument(id: number, documentId: number): Promise<ShipmentDocument> {
        try {
            const shipment = await this._shipmentDriver.getShipment(id);
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

    async getDocuments(id: number): Promise<Map<DocumentType, ShipmentDocument[]>> {
        const unresolvedDocuments = await this._shipmentDriver.getDocuments(id);
        const resolvedDocuments = new Map<DocumentType, ShipmentDocument[]>();
        for (const [documentType, documentInfos] of unresolvedDocuments.entries()) {
            const resolved: ShipmentDocument[] = [];
            for (const info of documentInfos) {
                resolved.push(await this.retrieveDocument(id, info.id));
            }
            resolvedDocuments.set(documentType, resolved);
        }
        return resolvedDocuments;
    }

    async getDocument(id: number, documentId: number): Promise<ShipmentDocument> {
        return this.retrieveDocument(id, documentId);
    }

    async addDocument(
        id: number,
        documentType: DocumentType,
        documentReferenceId: string,
        fileContent: Uint8Array,
        resourceSpec: ResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<Shipment> {
        // const externalUrl = `https://<storage_principal_id>.localhost:4943/organization/0/transactions/${id}`;
        if (!this._baseExternalUrl) throw new Error('Base external url is not set');

        const fileName = FileHelpers.removeFileExtension(resourceSpec.name);
        const spec = { ...resourceSpec };
        spec.name = `${this._baseExternalUrl}/${URL_SEGMENTS.FILE}${spec.name}`;
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
                name: `${this._baseExternalUrl}/${URL_SEGMENTS.FILE}${fileName}-metadata.json`,
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        return this._shipmentDriver.addDocument(id, documentType, spec.name);
    }

    async updateDocument(id: number, documentId: number, externalUrl: string): Promise<Shipment> {
        return this._shipmentDriver.updateDocument(id, documentId, externalUrl);
    }

    async approveDocument(id: number, documentId: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateDocument(id, documentId, EvaluationStatus.APPROVED);
    }

    async rejectDocument(id: number, documentId: number): Promise<Shipment> {
        return this._shipmentDriver.evaluateDocument(id, documentId, EvaluationStatus.NOT_APPROVED);
    }

    async getPhaseDocuments(phase: Phase): Promise<ShipmentPhaseDocument[]> {
        const documents = await this._shipmentDriver.getUploadableDocuments(phase);
        const requiredDocuments = await this._shipmentDriver.getRequiredDocuments(phase);
        return documents.map((documentType) => ({
            documentType,
            required: requiredDocuments.includes(documentType)
        }));
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
