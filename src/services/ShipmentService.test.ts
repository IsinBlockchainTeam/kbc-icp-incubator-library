import { createMock } from 'ts-auto-mock';
import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { ShipmentService } from './ShipmentService';
import { ShipmentDriver } from '../drivers/ShipmentDriver';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { RoleProof } from '../types/RoleProof';
import { DocumentType, Phase } from '../entities/Shipment';

describe('ShipmentService', () => {
    let shipmentService: ShipmentService;

    let mockedShipmentDriver: ShipmentDriver;
    let mockedDocumentDriver: DocumentDriver;
    let icpFileDriver: ICPFileDriver;

    const shipmentDriverInstance = {
        getShipment: jest.fn(),
        getPhase: jest.fn(),
        getDocumentsIds: jest.fn().mockResolvedValue([1]),
        getDocumentInfo: jest.fn(),
        setDetails: jest.fn(),
        evaluateSample: jest.fn(),
        evaluateDetails: jest.fn(),
        evaluateQuality: jest.fn(),
        depositFunds: jest.fn(),
        evaluateDocument: jest.fn(),
        getUploadableDocuments: jest.fn(),
        getRequiredDocuments: jest.fn(),
        addDocument: jest.fn()
    };
    const documentDriverInstance = {
        getDocumentById: jest.fn()
    };
    const icpFileDriverInstance = {
        create: jest.fn(),
        read: jest.fn()
    };

    const roleProof: RoleProof = createMock<RoleProof>();

    beforeAll(() => {
        mockedShipmentDriver = createMock<ShipmentDriver>(shipmentDriverInstance);
        mockedDocumentDriver = createMock<DocumentDriver>(documentDriverInstance);
        icpFileDriver = createMock<ICPFileDriver>(icpFileDriverInstance);

        shipmentService = new ShipmentService(
            mockedShipmentDriver,
            mockedDocumentDriver,
            icpFileDriver
        );
    });

    afterAll(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'getShipment',
            serviceFunction: () => shipmentService.getShipment(roleProof),
            expectedMockedFunction: shipmentDriverInstance.getShipment,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getPhase',
            serviceFunction: () => shipmentService.getPhase(roleProof),
            expectedMockedFunction: shipmentDriverInstance.getPhase,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getDocumentId',
            serviceFunction: () => shipmentService.getDocumentId(roleProof, 1),
            expectedMockedFunction: shipmentDriverInstance.getDocumentsIds,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getGenericDocumentsIds',
            serviceFunction: () => shipmentService.getGenericDocumentsIds(roleProof),
            expectedMockedFunction: shipmentDriverInstance.getDocumentsIds,
            expectedMockedFunctionArgs: [roleProof, DocumentType.GENERIC]
        },
        {
            serviceFunctionName: 'getDocumentInfo',
            serviceFunction: () => shipmentService.getDocumentInfo(roleProof, 1),
            expectedMockedFunction: shipmentDriverInstance.getDocumentInfo,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'setDetails',
            serviceFunction: () =>
                shipmentService.setDetails(
                    roleProof,
                    1,
                    new Date(),
                    new Date(),
                    'exchange',
                    1,
                    1,
                    1,
                    1,
                    1,
                    1
                ),
            expectedMockedFunction: shipmentDriverInstance.setDetails,
            expectedMockedFunctionArgs: [
                roleProof,
                1,
                expect.any(Date),
                expect.any(Date),
                'exchange',
                1,
                1,
                1,
                1,
                1,
                1
            ]
        },
        {
            serviceFunctionName: 'approveSample',
            serviceFunction: () => shipmentService.approveSample(roleProof),
            expectedMockedFunction: shipmentDriverInstance.evaluateSample,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'rejectSample',
            serviceFunction: () => shipmentService.rejectSample(roleProof),
            expectedMockedFunction: shipmentDriverInstance.evaluateSample,
            expectedMockedFunctionArgs: [roleProof, 2]
        },
        {
            serviceFunctionName: 'approveDetails',
            serviceFunction: () => shipmentService.approveDetails(roleProof),
            expectedMockedFunction: shipmentDriverInstance.evaluateDetails,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'rejectDetails',
            serviceFunction: () => shipmentService.rejectDetails(roleProof),
            expectedMockedFunction: shipmentDriverInstance.evaluateDetails,
            expectedMockedFunctionArgs: [roleProof, 2]
        },
        {
            serviceFunctionName: 'approveQuality',
            serviceFunction: () => shipmentService.approveQuality(roleProof),
            expectedMockedFunction: shipmentDriverInstance.evaluateQuality,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'rejectQuality',
            serviceFunction: () => shipmentService.rejectQuality(roleProof),
            expectedMockedFunction: shipmentDriverInstance.evaluateQuality,
            expectedMockedFunctionArgs: [roleProof, 2]
        },
        {
            serviceFunctionName: 'depositFunds',
            serviceFunction: () => shipmentService.depositFunds(roleProof, 1),
            expectedMockedFunction: shipmentDriverInstance.depositFunds,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'approveDocument',
            serviceFunction: () => shipmentService.approveDocument(roleProof, 1),
            expectedMockedFunction: shipmentDriverInstance.evaluateDocument,
            expectedMockedFunctionArgs: [roleProof, 1, 1]
        },
        {
            serviceFunctionName: 'rejectDocument',
            serviceFunction: () => shipmentService.rejectDocument(roleProof, 1),
            expectedMockedFunction: shipmentDriverInstance.evaluateDocument,
            expectedMockedFunctionArgs: [roleProof, 1, 2]
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );
    it('should get phaseDocuments', async () => {
        shipmentDriverInstance.getUploadableDocuments.mockResolvedValue([0, 1]);
        shipmentDriverInstance.getRequiredDocuments.mockResolvedValue([0]);
        const result = await shipmentService.getPhaseDocuments(Phase.PHASE_1);
        expect(result).toEqual([
            {
                documentType: DocumentType.SERVICE_GUIDE,
                required: true
            },
            {
                documentType: DocumentType.SENSORY_EVALUATION_ANALYSIS_REPORT,
                required: false
            }
        ]);
        expect(shipmentDriverInstance.getUploadableDocuments).toHaveBeenCalledTimes(1);
        expect(shipmentDriverInstance.getRequiredDocuments).toHaveBeenCalledTimes(1);
    });
    it('should add document', async () => {
        const shipmentExternalUrl = 'shipmentExternalUrl';
        const filename = 'filename';
        const fileContent = new Uint8Array([1, 2, 3]);
        const contentHash = new Uint8Array([4, 5, 6]);
        const bytesFromObject = new Uint8Array([7, 8, 9]);
        const resourceSpec = {
            name: 'name'
        } as ICPResourceSpec;
        const delegatedOrganizationIds = [1, 2, 3];

        shipmentDriverInstance.getShipment.mockResolvedValue({ externalUrl: shipmentExternalUrl });
        jest.spyOn(FileHelpers, 'removeFileExtension').mockReturnValue(filename);
        jest.spyOn(FileHelpers, 'getHash').mockReturnValue(contentHash);
        jest.spyOn(FileHelpers, 'getBytesFromObject').mockReturnValue(bytesFromObject);

        await shipmentService.addDocument(
            roleProof,
            DocumentType.SERVICE_GUIDE,
            'documentReferenceId',
            fileContent,
            resourceSpec,
            delegatedOrganizationIds
        );

        expect(icpFileDriverInstance.create).toHaveBeenCalledTimes(2);
        const spec = { name: `${shipmentExternalUrl}/files/name` };
        expect(icpFileDriverInstance.create).toHaveBeenNthCalledWith(
            1,
            fileContent,
            spec,
            delegatedOrganizationIds
        );
        expect(icpFileDriverInstance.create).toHaveBeenNthCalledWith(
            2,
            bytesFromObject,
            {
                name: 'shipmentExternalUrl/files/filename-metadata.json',
                type: 'application/json'
            },
            delegatedOrganizationIds
        );
        expect(shipmentDriverInstance.addDocument).toHaveBeenCalledTimes(1);
        expect(shipmentDriverInstance.addDocument).toHaveBeenCalledWith(
            roleProof,
            DocumentType.SERVICE_GUIDE,
            spec.name,
            contentHash.toString()
        );
    });
    it('should retrieve document', async () => {
        const documentInfo = {
            id: 1,
            externalUrl: 'externalUrl/path'
        };
        const path = 'externalUrl';
        const metadataName = 'metadataName';
        const documentMetadata = {
            filename: 'filename',
            documentType: DocumentType.SERVICE_GUIDE
        };
        const fileContent = new Uint8Array([1, 2, 3]);

        documentDriverInstance.getDocumentById.mockResolvedValue(documentInfo);
        jest.spyOn(documentInfo.externalUrl.split('/'), 'slice').mockReturnValue([path]);
        jest.spyOn(documentInfo.externalUrl.split(`${path}/`), 'slice').mockReturnValue([
            metadataName
        ]);
        jest.spyOn(FileHelpers, 'removeFileExtension').mockReturnValue(metadataName);
        jest.spyOn(FileHelpers, 'getObjectFromBytes').mockReturnValue(documentMetadata);
        icpFileDriverInstance.read.mockResolvedValue(fileContent);

        const result = await shipmentService.getDocument(roleProof, 1);

        expect(result).toEqual({
            id: documentInfo.id,
            filename: documentMetadata.filename,
            documentType: documentMetadata.documentType,
            fileContent
        });
        expect(documentDriverInstance.getDocumentById).toHaveBeenCalledTimes(1);
        expect(documentDriverInstance.getDocumentById).toHaveBeenCalledWith(roleProof, 1);
        expect(icpFileDriverInstance.read).toHaveBeenCalledTimes(2);
        expect(icpFileDriverInstance.read).toHaveBeenNthCalledWith(
            1,
            `${path}/${metadataName}-metadata.json`
        );
        expect(icpFileDriverInstance.read).toHaveBeenNthCalledWith(2, documentInfo.externalUrl);

        documentDriverInstance.getDocumentById.mockRejectedValueOnce(new Error('error'));
        await expect(shipmentService.getDocument(roleProof, 1)).rejects.toThrow(
            new Error('Error while retrieving document file from external storage: error')
        );
    });
    it('should throw error if try to get generic documents with wrong method', async () => {
        await expect(
            shipmentService.getDocumentId(roleProof, DocumentType.GENERIC)
        ).rejects.toThrow(new Error('Document type must be different from GENERIC'));
    });
});
