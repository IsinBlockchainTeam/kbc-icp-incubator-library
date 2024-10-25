import { ShipmentDriver } from '../ShipmentDriver';
import { FundStatus, Shipment, Phase } from '../../../entities/icp/Shipment';
import { createActor } from 'icp-declarations/entity_manager';
import { EntityBuilder } from '../../../utils/icp/EntityBuilder';
import { DocumentInfo, DocumentType } from '../../../entities/icp/Document';
import { EvaluationStatus } from '../../../entities/icp/Evaluation';
import {
    DocumentType as IDLDocumentType,
    EvaluationStatus as ICPEvaluationStatus,
    RoleProof
} from '@kbc-lib/azle-types';
import { Identity } from '@dfinity/agent';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../../utils/icp/EntityBuilder');

describe('ShipmentDriver', () => {
    let shipmentDriver: ShipmentDriver;
    const mockFn = {
        getShipments: jest.fn(),
        getShipment: jest.fn(),
        getShipmentPhase: jest.fn(),
        getDocumentsByType: jest.fn(),
        setShipmentDetails: jest.fn(),
        evaluateSample: jest.fn(),
        evaluateShipmentDetails: jest.fn(),
        evaluateQuality: jest.fn(),
        depositFunds: jest.fn(),
        lockFunds: jest.fn(),
        unlockFunds: jest.fn(),
        getDocuments: jest.fn(),
        addDocument: jest.fn(),
        updateDocument: jest.fn(),
        evaluateDocument: jest.fn(),
        getPhase1Documents: jest.fn(),
        getPhase1RequiredDocuments: jest.fn(),
        getPhase2Documents: jest.fn(),
        getPhase2RequiredDocuments: jest.fn(),
        getPhase3Documents: jest.fn(),
        getPhase3RequiredDocuments: jest.fn(),
        getPhase4Documents: jest.fn(),
        getPhase4RequiredDocuments: jest.fn(),
        getPhase5Documents: jest.fn(),
        getPhase5RequiredDocuments: jest.fn()
    };
    const defaultEntities = {
        shipment: { id: 0 } as Shipment,
        documents: new Map<DocumentType, DocumentInfo[]>([
            [DocumentType.PRE_SHIPMENT_SAMPLE, [{ id: 0 } as DocumentInfo]]
        ]),
        shipmentPhase: Phase.PHASE_1,
        fundStatus: FundStatus.NOT_LOCKED,
        evaluationStatus: EvaluationStatus.NOT_EVALUATED,
        idlEvaluationStatus: { [EvaluationStatus.NOT_EVALUATED]: null } as ICPEvaluationStatus,
        documentType: DocumentType.PRE_SHIPMENT_SAMPLE,
        idlDocumentType: { [DocumentType.PRE_SHIPMENT_SAMPLE]: null } as IDLDocumentType,
        documentInfo: { id: 0 } as DocumentInfo
    };
    const roleProof = {} as RoleProof;

    beforeAll(async () => {
        jest.clearAllMocks();
        (createActor as jest.Mock).mockReturnValue(mockFn);
        jest.spyOn(EntityBuilder, 'buildShipment').mockReturnValue(defaultEntities.shipment);
        jest.spyOn(EntityBuilder, 'buildShipmentDocuments').mockReturnValue(
            defaultEntities.documents
        );
        jest.spyOn(EntityBuilder, 'buildShipmentPhase').mockReturnValue(
            defaultEntities.shipmentPhase
        );
        jest.spyOn(EntityBuilder, 'buildFundStatus').mockReturnValue(defaultEntities.fundStatus);
        jest.spyOn(EntityBuilder, 'buildEvaluationStatus').mockReturnValue(
            defaultEntities.evaluationStatus
        );
        jest.spyOn(EntityBuilder, 'buildIDLEvaluationStatus').mockReturnValue(
            defaultEntities.idlEvaluationStatus
        );
        jest.spyOn(EntityBuilder, 'buildDocumentType').mockReturnValue(
            defaultEntities.documentType
        );
        jest.spyOn(EntityBuilder, 'buildIDLDocumentType').mockReturnValue(
            defaultEntities.idlDocumentType
        );
        jest.spyOn(EntityBuilder, 'buildDocumentInfo').mockReturnValue(
            defaultEntities.documentInfo
        );
        const icpIdentity = {} as Identity;
        shipmentDriver = new ShipmentDriver(icpIdentity, 'canisterId');
    });

    it('should retrieve shipments', async () => {
        mockFn.getShipments.mockReturnValue([defaultEntities.shipment]);
        await expect(shipmentDriver.getShipments(roleProof)).resolves.toEqual([
            defaultEntities.shipment
        ]);
        expect(mockFn.getShipments).toHaveBeenCalledTimes(1);
        expect(mockFn.getShipments).toHaveBeenCalledWith(roleProof);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should retrieve a shipment', async () => {
        mockFn.getShipment.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.getShipment(roleProof, 0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.getShipment).toHaveBeenCalledTimes(1);
        expect(mockFn.getShipment).toHaveBeenCalledWith(roleProof, BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should retrieve a shipment phase', async () => {
        mockFn.getShipmentPhase.mockReturnValue(defaultEntities.shipmentPhase);
        await expect(shipmentDriver.getShipmentPhase(roleProof, 0)).resolves.toEqual(
            defaultEntities.shipmentPhase
        );
        expect(mockFn.getShipmentPhase).toHaveBeenCalledTimes(1);
        expect(mockFn.getShipmentPhase).toHaveBeenCalledWith(roleProof, BigInt(0));
        expect(EntityBuilder.buildShipmentPhase).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipmentPhase).toHaveBeenCalledWith(
            defaultEntities.shipmentPhase
        );
    });

    it('should get documents by type', async () => {
        mockFn.getDocumentsByType.mockReturnValue(
            defaultEntities.documents.get(DocumentType.PRE_SHIPMENT_SAMPLE)
        );
        (EntityBuilder.buildIDLDocumentType as jest.Mock).mockReturnValue({
            [DocumentType.PRE_SHIPMENT_SAMPLE]: null
        });
        await expect(
            shipmentDriver.getDocumentsByType(roleProof, 0, DocumentType.PRE_SHIPMENT_SAMPLE)
        ).resolves.toEqual(defaultEntities.documents.get(DocumentType.PRE_SHIPMENT_SAMPLE));
        expect(mockFn.getDocumentsByType).toHaveBeenCalledTimes(1);
        expect(mockFn.getDocumentsByType).toHaveBeenCalledWith(roleProof, BigInt(0), {
            [DocumentType.PRE_SHIPMENT_SAMPLE]: null
        });
        expect(EntityBuilder.buildDocumentInfo).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildDocumentInfo).toHaveBeenCalledWith(defaultEntities.documentInfo);
        expect(EntityBuilder.buildIDLDocumentType).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildIDLDocumentType).toHaveBeenCalledWith(
            DocumentType.PRE_SHIPMENT_SAMPLE
        );
    });

    it('should set shipment details', async () => {
        mockFn.setShipmentDetails.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.setShipmentDetails(
                roleProof,
                0,
                0,
                0,
                0,
                'targetExchange',
                0,
                0,
                0,
                0,
                0,
                0
            )
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.setShipmentDetails).toHaveBeenCalledTimes(1);
        expect(mockFn.setShipmentDetails).toHaveBeenCalledWith(
            roleProof,
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            'targetExchange',
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0),
            BigInt(0)
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate sample', async () => {
        mockFn.evaluateSample.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateSample(roleProof, 0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateSample).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateSample).toHaveBeenCalledWith(
            roleProof,
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate shipment details', async () => {
        mockFn.evaluateShipmentDetails.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateShipmentDetails(roleProof, 0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateShipmentDetails).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateShipmentDetails).toHaveBeenCalledWith(
            roleProof,
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate quality', async () => {
        mockFn.evaluateQuality.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateQuality(roleProof, 0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateQuality).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateQuality).toHaveBeenCalledWith(
            roleProof,
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should deposit funds', async () => {
        mockFn.depositFunds.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.depositFunds(roleProof, 0, 0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.depositFunds).toHaveBeenCalledTimes(1);
        expect(mockFn.depositFunds).toHaveBeenCalledWith(roleProof, BigInt(0), BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should lock funds', async () => {
        mockFn.lockFunds.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.lockFunds(roleProof, 0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.lockFunds).toHaveBeenCalledTimes(1);
        expect(mockFn.lockFunds).toHaveBeenCalledWith(roleProof, BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should unlock funds', async () => {
        mockFn.unlockFunds.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.unlockFunds(roleProof, 0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.unlockFunds).toHaveBeenCalledTimes(1);
        expect(mockFn.unlockFunds).toHaveBeenCalledWith(roleProof, BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should get documents', async () => {
        mockFn.getDocuments.mockReturnValue([
            [DocumentType.PRE_SHIPMENT_SAMPLE, [{ id: 0 } as DocumentInfo]]
        ]);
        (EntityBuilder.buildShipmentDocuments as jest.Mock).mockReturnValue(
            defaultEntities.documents
        );
        await expect(shipmentDriver.getDocuments(roleProof, 0)).resolves.toEqual(
            defaultEntities.documents
        );
        expect(mockFn.getDocuments).toHaveBeenCalledTimes(1);
        expect(mockFn.getDocuments).toHaveBeenCalledWith(roleProof, BigInt(0));
        expect(EntityBuilder.buildShipmentDocuments).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipmentDocuments).toHaveBeenCalledWith([
            [DocumentType.PRE_SHIPMENT_SAMPLE, [{ id: 0 } as DocumentInfo]]
        ]);
    });

    it('should add a document', async () => {
        mockFn.addDocument.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.addDocument(roleProof, 0, DocumentType.PRE_SHIPMENT_SAMPLE, 'url')
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.addDocument).toHaveBeenCalledTimes(1);
        expect(mockFn.addDocument).toHaveBeenCalledWith(
            roleProof,
            BigInt(0),
            defaultEntities.idlDocumentType,
            'url'
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should update a document', async () => {
        mockFn.updateDocument.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.updateDocument(roleProof, 0, 0, 'url')).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.updateDocument).toHaveBeenCalledTimes(1);
        expect(mockFn.updateDocument).toHaveBeenCalledWith(roleProof, BigInt(0), BigInt(0), 'url');
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate a document', async () => {
        mockFn.evaluateDocument.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateDocument(roleProof, 0, 0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateDocument).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateDocument).toHaveBeenCalledWith(
            roleProof,
            BigInt(0),
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });
});
