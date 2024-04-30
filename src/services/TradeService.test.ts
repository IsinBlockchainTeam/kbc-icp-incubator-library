import { createMock } from 'ts-auto-mock';
import { SolidStorageACR } from '@blockchain-lib/common';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeService } from './TradeService';
import { DocumentType } from '../entities/DocumentInfo';
import { IStorageMetadataDriver } from '../drivers/IStorageMetadataDriver';
import { IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';
import { SolidDocumentSpec } from '../drivers/SolidDocumentDriver';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';
import { StorageOperationType } from '../types/StorageOperationType';
import { computeHashFromBuffer } from '../utils/utils';
import { DocumentDriver } from '../drivers/DocumentDriver';

describe('TradeService', () => {
    const mockedgetAllDocumentIds = jest.fn();
    const mockedgetAllDocumentIdsByType = jest.fn();
    const mockedGetDocumentById = jest.fn();

    const mockedTradeDriver: TradeDriver = createMock<TradeDriver>({
        getLineCounter: jest.fn(),
        getTradeType: jest.fn(),
        getLineExists: jest.fn(),
        getTradeStatus: jest.fn(),
        addDocument: jest.fn(),
        getAllDocumentIds: mockedgetAllDocumentIds,
        getDocumentIdsByType: mockedgetAllDocumentIdsByType,
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });
    const mockedDocumentDriver: DocumentDriver = createMock<DocumentDriver>({
        registerDocument: jest.fn(),
        getDocumentsCounter: jest.fn(),
        getDocumentById: mockedGetDocumentById,
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });
    const documentExternalUrl = 'doc_externalUrl';
    const mockedStorageMetadataDriver = createMock<IStorageMetadataDriver<SolidMetadataSpec, SolidStorageACR>>({
        create: jest.fn(),
    });
    const mockedStorageDocumentDriver = createMock<IStorageDocumentDriver<SolidDocumentSpec>>({
        create: jest.fn().mockResolvedValue(documentExternalUrl),
    });

    const documentBuffer = new Uint8Array([1, 2, 3, 4, 5]);
    const documentSpec: SolidDocumentSpec = {
        filename: 'filename',
        bcResourceId: 'bcResourceId',
    };
    const metadata = { metadata: 'metadata content' };
    const metadataSpec: SolidMetadataSpec = {
        resourceName: 'resourceName',
        bcResourceId: 'bcResourceId',
    };

    let tradeService: TradeService<SolidMetadataSpec, SolidDocumentSpec, SolidStorageACR>;

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getLineCounter',
            serviceFunction: () => tradeService.getLineCounter(),
            expectedMockedFunction: mockedTradeDriver.getLineCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTradeType',
            serviceFunction: () => tradeService.getTradeType(),
            expectedMockedFunction: mockedTradeDriver.getTradeType,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLineExists',
            serviceFunction: () => tradeService.getLineExists(1),
            expectedMockedFunction: mockedTradeDriver.getLineExists,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getTradeStatus',
            serviceFunction: () => tradeService.getTradeStatus(),
            expectedMockedFunction: mockedTradeDriver.getTradeStatus,
            expectedMockedFunctionArgs: [],
        },
        // TODO: fix this test
        // {
        //     storageDrivers: { metadata: true, document: true },
        //     serviceFunctionName: 'addDocument with metadata and storage drivers',
        //     serviceFunction: () => tradeService.addDocument(DocumentType.DELIVERY_NOTE, { spec: documentSpec, fileBuffer: documentBuffer }, { spec: metadataSpec, value: metadata }),
        //     expectedMockedFunction: mockedTradeDriver.addDocument,
        //     expectedMockedFunctionArgs: [DocumentType.DELIVERY_NOTE, documentExternalUrl, computeHashFromBuffer(documentBuffer)],
        // },
        {
            serviceFunctionName: 'addDocument without metadata and storage drivers',
            serviceFunction: () => tradeService.addDocument(DocumentType.DELIVERY_NOTE),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: [DocumentType.DELIVERY_NOTE, '', ''],
        },
        // TODO: fix this test
        // {
        //     storageDrivers: { metadata: true },
        //     serviceFunctionName: 'add document - create (metadata driver)',
        //     serviceFunction: () => tradeService.addDocument(DocumentType.DELIVERY_NOTE, undefined, { spec: metadataSpec, value: metadata }),
        //     expectedMockedFunction: mockedStorageMetadataDriver.create,
        //     expectedMockedFunctionArgs: [StorageOperationType.TRANSACTION_DOCUMENT, metadata, [], metadataSpec],
        // },
        // {
        //     storageDrivers: { document: true },
        //     serviceFunctionName: 'add document - create (document driver)',
        //     serviceFunction: () => tradeService.addDocument(DocumentType.DELIVERY_NOTE, { spec: documentSpec, fileBuffer: documentBuffer }),
        //     expectedMockedFunction: mockedStorageDocumentDriver.create,
        //     expectedMockedFunctionArgs: [StorageOperationType.TRANSACTION_DOCUMENT, documentBuffer, documentSpec],
        // },
        {
            serviceFunctionName: 'getAllDocumentIds',
            serviceFunction: () => tradeService.getAllDocumentIds(),
            expectedMockedFunction: mockedTradeDriver.getAllDocumentIds,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getAllDocumentIdsByType',
            serviceFunction: () => tradeService.getDocumentIdsByType(DocumentType.DELIVERY_NOTE),
            expectedMockedFunction: mockedTradeDriver.getDocumentIdsByType,
            expectedMockedFunctionArgs: [DocumentType.DELIVERY_NOTE],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => tradeService.addAdmin('testAddress'),
            expectedMockedFunction: mockedTradeDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => tradeService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedTradeDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        // TODO: remove this comments
    // ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs, storageDrivers }) => {
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        tradeService = new TradeService({
            tradeDriver: mockedTradeDriver,
            // storageMetadataDriver: storageDrivers?.metadata ? mockedStorageMetadataDriver : undefined,
            // storageDocumentDriver: storageDrivers?.document ? mockedStorageDocumentDriver : undefined,
        });
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    describe('getDocuments', () => {
        it('should get all documents of a trade', async () => {
            const documentIds = [1, 2];
            const documentInfo = { id: 1, externalUrl: 'url', contentHash: 'hash' };
            mockedgetAllDocumentIds.mockResolvedValue(documentIds);
            mockedGetDocumentById.mockResolvedValue(documentInfo);

            tradeService = new TradeService({
                tradeDriver: mockedTradeDriver,
                documentDriver: mockedDocumentDriver,
            });

            const result = await tradeService.getAllDocuments();
            expect(result).toEqual([documentInfo, documentInfo]);

            expect(mockedgetAllDocumentIds).toHaveBeenCalledTimes(1);

            expect(mockedGetDocumentById).toHaveBeenCalledTimes(documentIds.length);
            documentIds.forEach((id, index) => {
                expect(mockedGetDocumentById).toHaveBeenNthCalledWith(index + 1, id);
            });
        });

        it('should throw an error if the document driver is not available', async () => {
            tradeService = new TradeService({
                tradeDriver: mockedTradeDriver,
            });

            await expect(tradeService.getAllDocuments()).rejects.toThrow('Cannot perform this operation without a document driver');
        });
    });

    describe('getDocumentsByType', () => {
        it('should get documents by document type', async () => {
            const documentIds = [1, 2];
            const documentInfo = { id: 1, externalUrl: 'url', contentHash: 'hash' };
            mockedgetAllDocumentIdsByType.mockResolvedValue(documentIds);
            mockedGetDocumentById.mockResolvedValue(documentInfo);

            tradeService = new TradeService({
                tradeDriver: mockedTradeDriver,
                documentDriver: mockedDocumentDriver,
            });

            const result = await tradeService.getDocumentsByType(DocumentType.DELIVERY_NOTE);
            expect(result).toEqual([documentInfo, documentInfo]);

            expect(mockedgetAllDocumentIdsByType).toHaveBeenCalledTimes(1);
            expect(mockedgetAllDocumentIdsByType).toHaveBeenNthCalledWith(1, DocumentType.DELIVERY_NOTE);

            expect(mockedGetDocumentById).toHaveBeenCalledTimes(documentIds.length);
            documentIds.forEach((id, index) => {
                expect(mockedGetDocumentById).toHaveBeenNthCalledWith(index + 1, id);
            });
        });

        it('should throw an error if the document driver is not available', async () => {
            tradeService = new TradeService({
                tradeDriver: mockedTradeDriver,
            });

            await expect(tradeService.getDocumentsByType(DocumentType.DELIVERY_NOTE)).rejects.toThrow('Cannot perform this operation without a document driver');
        });
    });
});
