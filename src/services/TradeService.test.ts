import { FileHelpers, ICPResourceSpec } from '@blockchain-lib/common';
import { createMock } from 'ts-auto-mock';
import { TradeService } from './TradeService';
import { DocumentType } from '../entities/DocumentInfo';
import { DocumentStatus, TransactionLine } from '../entities/Document';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { TradeDriver } from '../drivers/TradeDriver';
import { RoleProof } from '../types/RoleProof';

describe('TradeService', () => {
    const mockedGetAllDocumentIds = jest.fn();
    const mockedGetAllDocumentIdsByType = jest.fn();
    const mockedGetDocumentById = jest.fn();
    const mockedTradeDriver = createMock<TradeDriver>({
        getLineCounter: jest.fn(),
        getTradeType: jest.fn(),
        getLineExists: jest.fn(),
        addDocument: jest.fn(),
        validateDocument: jest.fn(),
        getAllDocumentIds: mockedGetAllDocumentIds,
        getDocumentIdsByType: mockedGetAllDocumentIdsByType
    });
    const mockedDocumentDriver = createMock<DocumentDriver>({
        registerDocument: jest.fn(),
        updateDocument: jest.fn(),
        getDocumentsCounter: jest.fn(),
        getDocumentById: mockedGetDocumentById,
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
        addTradeManager: jest.fn(),
        removeTradeManager: jest.fn()
    });
    const mockedIcpFileDriver: ICPFileDriver = createMock<ICPFileDriver>({
        create: jest.fn()
    });

    const externalUrl = 'externalUrl';
    const resourceSpec: ICPResourceSpec = {
        name: 'resourceName.pdf',
        type: 'resourceType'
    };
    const delegatedOrganizationIds = [1, 2];
    const transactionLines: TransactionLine[] = [{ id: 1, quantity: 1 }];
    const quantity = 250;

    let tradeService: TradeService;

    const roleProof: RoleProof = createMock<RoleProof>();

    beforeAll(() => {
        jest.useFakeTimers().setSystemTime(new Date());
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getLineCounter',
            serviceFunction: () => tradeService.getLineCounter(roleProof),
            expectedMockedFunction: mockedTradeDriver.getLineCounter,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getTradeType',
            serviceFunction: () => tradeService.getTradeType(roleProof),
            expectedMockedFunction: mockedTradeDriver.getTradeType,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getLineExists',
            serviceFunction: () => tradeService.getLineExists(roleProof, 1),
            expectedMockedFunction: mockedTradeDriver.getLineExists,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'validateDocument',
            serviceFunction: () =>
                tradeService.validateDocument(roleProof, 1, DocumentStatus.APPROVED),
            expectedMockedFunction: mockedTradeDriver.validateDocument,
            expectedMockedFunctionArgs: [roleProof, 1, DocumentStatus.APPROVED]
        },
        {
            serviceFunctionName: 'getAllDocumentIds',
            serviceFunction: () => tradeService.getAllDocumentIds(roleProof),
            expectedMockedFunction: mockedTradeDriver.getAllDocumentIds,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getAllDocumentIdsByType',
            serviceFunction: () =>
                tradeService.getDocumentIdsByType(roleProof, DocumentType.DELIVERY_NOTE),
            expectedMockedFunction: mockedTradeDriver.getDocumentIdsByType,
            expectedMockedFunctionArgs: [roleProof, DocumentType.DELIVERY_NOTE]
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            tradeService = new TradeService(
                mockedTradeDriver,
                mockedDocumentDriver,
                mockedIcpFileDriver
            );
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );

    describe('addDocument', () => {
        it('should add a document', async () => {
            tradeService = new TradeService(
                mockedTradeDriver,
                mockedDocumentDriver,
                mockedIcpFileDriver
            );
            await tradeService.addDocument(
                roleProof,
                DocumentType.DELIVERY_NOTE,
                new Uint8Array([1, 2, 3]),
                externalUrl,
                resourceSpec,
                delegatedOrganizationIds,
                transactionLines,
                quantity
            );

            expect(mockedIcpFileDriver.create).toHaveBeenCalledTimes(2);
            expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
                1,
                new Uint8Array([1, 2, 3]),
                resourceSpec,
                delegatedOrganizationIds
            );
            expect(mockedIcpFileDriver.create).toHaveBeenNthCalledWith(
                2,
                FileHelpers.getBytesFromObject({
                    fileName: resourceSpec.name,
                    documentType: DocumentType.DELIVERY_NOTE,
                    date: new Date(),
                    transactionLines,
                    quantity
                }),
                {
                    name: `${FileHelpers.removeFileExtension(resourceSpec.name)}-metadata.json`,
                    type: 'application/json'
                },
                delegatedOrganizationIds
            );

            expect(mockedTradeDriver.addDocument).toHaveBeenCalledTimes(1);
            expect(mockedTradeDriver.addDocument).toHaveBeenCalledWith(
                roleProof,
                DocumentType.DELIVERY_NOTE,
                resourceSpec.name,
                FileHelpers.getHash(new Uint8Array([1, 2, 3])).toString()
            );
        });
    });

    describe('getDocuments', () => {
        it('should get all documents of a trade', async () => {
            const documentIds = [1, 2];
            const documentInfo = { id: 1, externalUrl: 'url', contentHash: 'hash' };
            mockedGetAllDocumentIds.mockResolvedValue(documentIds);
            mockedGetDocumentById.mockResolvedValue(documentInfo);

            tradeService = new TradeService(mockedTradeDriver, mockedDocumentDriver);

            const result = await tradeService.getAllDocuments(roleProof);
            expect(result).toEqual([documentInfo, documentInfo]);

            expect(mockedGetAllDocumentIds).toHaveBeenCalledTimes(1);

            expect(mockedGetDocumentById).toHaveBeenCalledTimes(documentIds.length);
            documentIds.forEach((id, index) => {
                expect(mockedGetDocumentById).toHaveBeenNthCalledWith(index + 1, roleProof, id);
            });
        });

        it('should throw an error if the document driver is not available', async () => {
            tradeService = new TradeService(mockedTradeDriver);

            await expect(tradeService.getAllDocuments(roleProof)).rejects.toThrow(
                'Cannot perform this operation without a document driver'
            );
        });
    });

    describe('getDocumentsByType', () => {
        it('should get documents by document type', async () => {
            const documentIds = [1, 2];
            const documentInfo = { id: 1, externalUrl: 'url', contentHash: 'hash' };
            mockedGetAllDocumentIdsByType.mockResolvedValue(documentIds);
            mockedGetDocumentById.mockResolvedValue(documentInfo);

            tradeService = new TradeService(mockedTradeDriver, mockedDocumentDriver);

            const result = await tradeService.getDocumentsByType(
                roleProof,
                DocumentType.DELIVERY_NOTE
            );
            expect(result).toEqual([documentInfo, documentInfo]);

            expect(mockedGetAllDocumentIdsByType).toHaveBeenCalledTimes(1);
            expect(mockedGetAllDocumentIdsByType).toHaveBeenNthCalledWith(
                1,
                roleProof,
                DocumentType.DELIVERY_NOTE
            );

            expect(mockedGetDocumentById).toHaveBeenCalledTimes(documentIds.length);
            documentIds.forEach((id, index) => {
                expect(mockedGetDocumentById).toHaveBeenNthCalledWith(index + 1, roleProof, id);
            });
        });

        it('should throw an error if the document driver is not available', async () => {
            tradeService = new TradeService(mockedTradeDriver);

            await expect(
                tradeService.getDocumentsByType(roleProof, DocumentType.DELIVERY_NOTE)
            ).rejects.toThrow('Cannot perform this operation without a document driver');
        });
    });
});
