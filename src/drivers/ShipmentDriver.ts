import { Signer } from 'ethers';
import { Shipment as ShipmentContract, Shipment__factory } from '../smart-contracts';
import {
    DocumentEvaluationStatus,
    DocumentInfo,
    DocumentType,
    EvaluationStatus,
    Phase,
    Shipment
} from '../entities/Shipment';
import { RoleProof } from '../types/RoleProof';

export class ShipmentDriver {
    private _contract: ShipmentContract;

    constructor(signer: Signer, shipmentAddress: string) {
        this._contract = Shipment__factory.connect(shipmentAddress, signer.provider!).connect(
            signer
        );
    }

    async getShipment(roleProof: RoleProof): Promise<Shipment> {
        const result = await this._contract.getShipment(roleProof);
        return new Shipment(
            result[0], // supplier
            result[1], // commissioner
            result[2], // externalUrl
            result[3], // escrowAddress
            result[4], // documentManagerAddress
            result[5], // sampleEvaluationStatus
            result[6], // detailsEvaluationStatus
            result[7], // qualityEvaluationStatus
            result[8], // fundsStatus
            result[9], // detailsSet
            result[10].toNumber(), // shipmentNumber
            new Date(result[11].toNumber()), // expirationDate
            new Date(result[12].toNumber()), // fixingDate
            result[13], // targetExchange
            result[14].toNumber(), // differentialApplied
            result[15].toNumber(), // price
            result[16].toNumber(), // quantity
            result[17].toNumber(), // containersNumber
            result[18].toNumber(), // netWeight
            result[19].toNumber(), // grossWeight
        );
    }

    async getPhase(roleProof: RoleProof): Promise<Phase> {
        return this._contract.getPhase(roleProof);
    }

    async getDocumentsIds(roleProof: RoleProof, documentType: DocumentType): Promise<number[]> {
        return (await this._contract.getDocumentsIds(roleProof, documentType)).map((value) =>
            value.toNumber()
        );
    }

    async getDocumentInfo(roleProof: RoleProof, documentId: number): Promise<DocumentInfo | null> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const result = await this._contract.getDocumentInfo(roleProof, documentId);
        if(!result[4])
            return null;
        return new DocumentInfo(result[0].toNumber(), result[1], result[2], result[3]);
    }

    async setDetails(roleProof: RoleProof, shipmentNumber: number, expirationDate: Date, fixingDate: Date, targetExchange: string, differentialApplied: number, price: number, quantity: number, containersNumber: number, netWeight: number, grossWeight: number): Promise<void> {
        if (shipmentNumber < 0 || price < 0 || quantity < 0 || containersNumber < 0 || netWeight < 0 || grossWeight < 0 || differentialApplied < 0) {
            throw new Error('Invalid arguments');
        }
        const tx = await this._contract.setDetails(roleProof, shipmentNumber, expirationDate.getTime(), fixingDate.getTime(), targetExchange, differentialApplied, price, quantity, containersNumber, netWeight, grossWeight);
        await tx.wait();
    }

    async evaluateSample(roleProof: RoleProof, evaluationStatus: EvaluationStatus): Promise<void> {
        const tx = await this._contract.evaluateSample(roleProof, evaluationStatus);
        await tx.wait();
    }

    async evaluateDetails(roleProof: RoleProof, evaluationStatus: EvaluationStatus): Promise<void> {
        const tx = await this._contract.evaluateDetails(roleProof, evaluationStatus);
        await tx.wait();
    }

    async evaluateQuality(roleProof: RoleProof, evaluationStatus: EvaluationStatus): Promise<void> {
        const tx = await this._contract.evaluateQuality(roleProof, evaluationStatus);
        await tx.wait();
    }

    async depositFunds(roleProof: RoleProof, amount: number): Promise<void> {
        if (amount <= 0) {
            throw new Error('Amount must be greater than 0');
        }
        const tx = await this._contract.depositFunds(roleProof, amount);
        await tx.wait();
    }

    async addDocument(roleProof: RoleProof, documentType: DocumentType, externalUrl: string, documentHash: string): Promise<void> {
        const tx = await this._contract.addDocument(
            roleProof,
            documentType,
            externalUrl,
            documentHash
        );
        await tx.wait();
    }

    async updateDocument(roleProof: RoleProof, documentId: number, externalUrl: string, documentHash: string): Promise<void> {
        const tx = await this._contract.updateDocument(
            roleProof,
            documentId,
            externalUrl,
            documentHash
        );
        await tx.wait();
    }

    async evaluateDocument(roleProof: RoleProof, documentId: number, documentEvaluationStatus: DocumentEvaluationStatus): Promise<void> {
        if (documentId < 0) {
            throw new Error('Document ID must be greater than or equal to 0');
        }
        const tx = await this._contract.evaluateDocument(roleProof, documentId, documentEvaluationStatus);
        await tx.wait();
    }

    async getUploadableDocuments(phase: Phase): Promise<DocumentType[]> {
        return this._contract.getUploadableDocuments(phase);
    }

    async getRequiredDocuments(phase: Phase): Promise<DocumentType[]> {
        return this._contract.getRequiredDocuments(phase);
    }
}
