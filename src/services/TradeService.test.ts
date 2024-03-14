import { createMock } from 'ts-auto-mock';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeService } from './TradeService';
import { DocumentType } from '../entities/DocumentInfo';
import { IStorageMetadataDriver, OperationType } from '../drivers/IStorageMetadataDriver';
import { IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';
import { SolidDocumentSpec } from '../drivers/SolidDocumentDriver';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';

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
    const mockedStorageMetadataDriver = createMock<IStorageMetadataDriver<SolidMetadataSpec>>({
        create: jest.fn(),
    });
    const mockedStorageDocumentDriver = createMock<IStorageDocumentDriver<SolidDocumentSpec>>({
        create: jest.fn().mockResolvedValue(documentExternalUrl),
    });

    const documentBuffer = Buffer.from('file content');
    const documentSpec: SolidDocumentSpec = {
        filename: 'filename',
        bcResourceId: 'bcResourceId',
    };
    const metadata = { metadata: 'metadata content' };
    const metadataSpec: SolidMetadataSpec = {
        resourceName: 'resourceName',
        bcResourceId: 'bcResourceId',
    };

    let tradeService: TradeService<SolidDocumentSpec, SolidMetadataSpec>;

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
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, { spec: documentSpec, fileBuffer: documentBuffer }, { spec: metadataSpec, value: metadata }),
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
            serviceFunctionName: 'add document - create (metadata driver)',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, undefined, { spec: metadataSpec, value: metadata }),
            expectedMockedFunction: mockedStorageMetadataDriver.create,
            expectedMockedFunctionArgs: [OperationType.TRANSACTION_DOCUMENT, metadata, metadataSpec],
        },
        {
            storageDrivers: { document: true },
            serviceFunctionName: 'add document - create (document driver)',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, { spec: documentSpec, fileBuffer: documentBuffer }),
            expectedMockedFunction: mockedStorageDocumentDriver.create,
            expectedMockedFunctionArgs: [OperationType.TRANSACTION_DOCUMENT, documentBuffer, documentSpec],
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
