import { createActor } from 'icp-declarations/entity_manager';
import {
    DocumentType as IDLDocumentType,
    EvaluationStatus as ICPEvaluationStatus
} from '@kbc-lib/azle-types';
import { Identity } from '@dfinity/agent';
import { ShipmentDriver } from '../ShipmentDriver';
import { FundStatus, Shipment, Phase } from '../../../entities/icp/Shipment';
import { EntityBuilder } from '../../../utils/icp/EntityBuilder';
import { DocumentInfo, DocumentType } from '../../../entities/icp/Document';
import { EvaluationStatus } from '../../../entities/icp/Evaluation';

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
        await expect(shipmentDriver.getShipments()).resolves.toEqual([
            defaultEntities.shipment
        ]);
        expect(mockFn.getShipments).toHaveBeenCalledTimes(1);
        expect(mockFn.getShipments).toHaveBeenCalledWith();
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should retrieve a shipment', async () => {
        mockFn.getShipment.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.getShipment(0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.getShipment).toHaveBeenCalledTimes(1);
        expect(mockFn.getShipment).toHaveBeenCalledWith(BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should retrieve a shipment phase', async () => {
        mockFn.getShipmentPhase.mockReturnValue(defaultEntities.shipmentPhase);
        await expect(shipmentDriver.getShipmentPhase(0)).resolves.toEqual(
            defaultEntities.shipmentPhase
        );
        expect(mockFn.getShipmentPhase).toHaveBeenCalledTimes(1);
        expect(mockFn.getShipmentPhase).toHaveBeenCalledWith(BigInt(0));
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
            shipmentDriver.getDocumentsByType(0, DocumentType.PRE_SHIPMENT_SAMPLE)
        ).resolves.toEqual(defaultEntities.documents.get(DocumentType.PRE_SHIPMENT_SAMPLE));
        expect(mockFn.getDocumentsByType).toHaveBeenCalledTimes(1);
        expect(mockFn.getDocumentsByType).toHaveBeenCalledWith(BigInt(0), {
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
                0,
                0,
                new Date(0),
                new Date(0),
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
            shipmentDriver.evaluateSample(0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateSample).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateSample).toHaveBeenCalledWith(
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate shipment details', async () => {
        mockFn.evaluateShipmentDetails.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateShipmentDetails(0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateShipmentDetails).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateShipmentDetails).toHaveBeenCalledWith(
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate quality', async () => {
        mockFn.evaluateQuality.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateQuality(0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateQuality).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateQuality).toHaveBeenCalledWith(
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should deposit funds', async () => {
        mockFn.depositFunds.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.depositFunds(0, 0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.depositFunds).toHaveBeenCalledTimes(1);
        expect(mockFn.depositFunds).toHaveBeenCalledWith(BigInt(0), BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should lock funds', async () => {
        mockFn.lockFunds.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.lockFunds(0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.lockFunds).toHaveBeenCalledTimes(1);
        expect(mockFn.lockFunds).toHaveBeenCalledWith(BigInt(0));
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should unlock funds', async () => {
        mockFn.unlockFunds.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.unlockFunds(0)).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.unlockFunds).toHaveBeenCalledTimes(1);
        expect(mockFn.unlockFunds).toHaveBeenCalledWith(BigInt(0));
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
        await expect(shipmentDriver.getDocuments(0)).resolves.toEqual(
            defaultEntities.documents
        );
        expect(mockFn.getDocuments).toHaveBeenCalledTimes(1);
        expect(mockFn.getDocuments).toHaveBeenCalledWith(BigInt(0));
        expect(EntityBuilder.buildShipmentDocuments).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipmentDocuments).toHaveBeenCalledWith([
            [DocumentType.PRE_SHIPMENT_SAMPLE, [{ id: 0 } as DocumentInfo]]
        ]);
    });

    it('should add a document', async () => {
        mockFn.addDocument.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.addDocument(0, DocumentType.PRE_SHIPMENT_SAMPLE, 'url')
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.addDocument).toHaveBeenCalledTimes(1);
        expect(mockFn.addDocument).toHaveBeenCalledWith(
            BigInt(0),
            defaultEntities.idlDocumentType,
            'url'
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should update a document', async () => {
        mockFn.updateDocument.mockReturnValue(defaultEntities.shipment);
        await expect(shipmentDriver.updateDocument(0, 0, 'url')).resolves.toEqual(
            defaultEntities.shipment
        );
        expect(mockFn.updateDocument).toHaveBeenCalledTimes(1);
        expect(mockFn.updateDocument).toHaveBeenCalledWith(BigInt(0), BigInt(0), 'url');
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should evaluate a document', async () => {
        mockFn.evaluateDocument.mockReturnValue(defaultEntities.shipment);
        await expect(
            shipmentDriver.evaluateDocument(0, 0, EvaluationStatus.NOT_EVALUATED)
        ).resolves.toEqual(defaultEntities.shipment);
        expect(mockFn.evaluateDocument).toHaveBeenCalledTimes(1);
        expect(mockFn.evaluateDocument).toHaveBeenCalledWith(
            BigInt(0),
            BigInt(0),
            defaultEntities.idlEvaluationStatus
        );
        expect(EntityBuilder.buildShipment).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildShipment).toHaveBeenCalledWith(defaultEntities.shipment);
    });

    it('should get phase 1 documents', async () => {
        mockFn.getPhase1Documents.mockReturnValue([DocumentType.PRE_SHIPMENT_SAMPLE]);
        (EntityBuilder.buildDocumentType as jest.Mock).mockReturnValue(
            DocumentType.PRE_SHIPMENT_SAMPLE
        );
        await expect(shipmentDriver.getPhase1Documents()).resolves.toEqual([
            DocumentType.PRE_SHIPMENT_SAMPLE
        ]);
        expect(mockFn.getPhase1Documents).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildDocumentType).toHaveBeenCalledTimes(1);
    });

    type ShipmentPhaseDocumentsMethods =
        | 'getPhase1Documents'
        | 'getPhase1RequiredDocuments'
        | 'getPhase2Documents'
        | 'getPhase2RequiredDocuments'
        | 'getPhase3Documents'
        | 'getPhase3RequiredDocuments'
        | 'getPhase4Documents'
        | 'getPhase4RequiredDocuments'
        | 'getPhase5Documents'
        | 'getPhase5RequiredDocuments';
    type ShipmentMockPhaseDocumentsMethods = ShipmentPhaseDocumentsMethods;

    it.each([
        {
            fnName: 'getPhase1Documents',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase1RequiredDocuments',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase2Documents',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase2RequiredDocuments',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase3Documents',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase3RequiredDocuments',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase4Documents',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase4RequiredDocuments',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase5Documents',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        },
        {
            fnName: 'getPhase5RequiredDocuments',
            documents: [DocumentType.PRE_SHIPMENT_SAMPLE]
        }
    ])('should call $fnName', async ({ fnName, documents }) => {
        mockFn[fnName as ShipmentPhaseDocumentsMethods].mockReturnValue(documents);
        (EntityBuilder.buildDocumentType as jest.Mock).mockReturnValue(
            DocumentType.PRE_SHIPMENT_SAMPLE
        );
        await expect(shipmentDriver[fnName as ShipmentPhaseDocumentsMethods]()).resolves.toEqual(
            documents
        );
        expect(mockFn[fnName as ShipmentMockPhaseDocumentsMethods]).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildDocumentType).toHaveBeenCalledTimes(1);
    });
});
