import { createMock } from 'ts-auto-mock';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeService } from './TradeService';
import { DocumentType } from '../entities/DocumentInfo';
import { IStorageMetadataDriver, MetadataStorage, MetadataType } from '../drivers/IStorageMetadataDriver';
import { DocumentStorage, IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';

describe('TradeService', () => {
    const mockedTradeDriver: TradeDriver = createMock<TradeDriver>({
        getLineCounter: jest.fn(),
        getTradeType: jest.fn(),
        getLineExists: jest.fn(),
        getTradeStatus: jest.fn(),
        addDocument: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });
    const documentExternalUrl = 'doc_externalUrl';
    const mockedStorageMetadataDriver = createMock<IStorageMetadataDriver>({
        create: jest.fn(),
    });
    const mockedStorageDocumentDriver = createMock<IStorageDocumentDriver>({
        create: jest.fn().mockResolvedValue(documentExternalUrl),
    });

    const documentStorage: DocumentStorage = {
        filename: 'filename',
        fileBuffer: Buffer.from('file content'),
        bcResourceId: 'bcResourceId',
    };
    const metadataStorage: MetadataStorage = {
        metadata: { metadata: 'metadata content' },
        resourceName: 'resourceName',
        bcResourceId: 'bcResourceId',
    };

    let tradeService: TradeService;

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
        {
            storageDrivers: { metadata: true, document: true },
            serviceFunctionName: 'addDocument with metadata and storage drivers',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, documentStorage, metadataStorage),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: [1, 'doc name', DocumentType.DELIVERY_NOTE, documentExternalUrl],
        },
        {
            serviceFunctionName: 'addDocument without metadata and storage drivers',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: [1, 'doc name', DocumentType.DELIVERY_NOTE, ''],
        },
        {
            storageDrivers: { metadata: true },
            serviceFunctionName: 'create (metadata driver)',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, undefined, metadataStorage),
            expectedMockedFunction: mockedStorageMetadataDriver.create,
            expectedMockedFunctionArgs: [MetadataType.TRANSACTION_DOCUMENT, metadataStorage],
        },
        {
            storageDrivers: { document: true },
            serviceFunctionName: 'create (document driver)',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, documentStorage),
            expectedMockedFunction: mockedStorageDocumentDriver.create,
            expectedMockedFunctionArgs: [MetadataType.TRANSACTION_DOCUMENT, documentStorage],
        },
        {
            serviceFunctionName: 'addDocument without metadata and storage drivers',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: [1, 'doc name', DocumentType.DELIVERY_NOTE, ''],
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
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs, storageDrivers }) => {
        tradeService = new TradeService({
            tradeDriver: mockedTradeDriver,
            storageMetadataDriver: storageDrivers?.metadata ? mockedStorageMetadataDriver : undefined,
            storageDocumentDriver: storageDrivers?.document ? mockedStorageDocumentDriver : undefined,
        });
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
