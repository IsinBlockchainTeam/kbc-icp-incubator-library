import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { ShipmentDriver } from '../drivers/ShipmentDriver';
import { DocumentInfo, DocumentType, Shipment, ShipmentPhase } from '../entities/Shipment';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';

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

    async getShipment(): Promise<Shipment> {
        return this._shipmentManagerDriver.getShipment();
    }

    async getPhase(): Promise<ShipmentPhase> {
        return this._shipmentManagerDriver.getPhase();
    }

    async getDocumentInfo(documentId: number): Promise<DocumentInfo> {
        return this._shipmentManagerDriver.getDocumentInfo(documentId);
    }

    async getDocumentsIdsByType(documentType: number): Promise<number[]> {
        return this._shipmentManagerDriver.getDocumentsIdsByType(documentType);
    }

    async getAllDocumentIds(): Promise<number[]> {
        return this._shipmentManagerDriver.getAllDocumentIds();
    }

    async updateShipment(
        expirationDate: Date,
        quantity: number,
        weight: number,
        price: number
    ): Promise<void> {
        return this._shipmentManagerDriver.updateShipment(expirationDate, quantity, weight, price);
    }

    async approveShipment(): Promise<void> {
        return this._shipmentManagerDriver.approveShipment();
    }

    async depositFunds(amount: number): Promise<void> {
        return this._shipmentManagerDriver.depositFunds(amount);
    }

    async addDocument(
        documentType: DocumentType,
        documentReferenceId: string,
        fileContent: Uint8Array,
        resourceSpec: ICPResourceSpec,
        delegatedOrganizationIds: number[] = []
    ): Promise<void> {
        const shipmentExternalUrl = (await this.getShipment()).externalUrl;
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
            documentType,
            spec.name,
            contentHash.toString()
        );
    }

    async getDocument(documentId: number): Promise<ShipmentDocument> {
        try {
            const documentInfo = await this._documentDriver.getDocumentById(documentId);
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

    async approveDocument(documentId: number): Promise<void> {
        return this._shipmentManagerDriver.approveDocument(documentId);
    }

    async rejectDocument(documentId: number): Promise<void> {
        return this._shipmentManagerDriver.rejectDocument(documentId);
    }

    async confirmShipment(): Promise<void> {
        return this._shipmentManagerDriver.confirmShipment();
    }

    async startShipmentArbitration(): Promise<void> {
        return this._shipmentManagerDriver.startShipmentArbitration();
    }
}
