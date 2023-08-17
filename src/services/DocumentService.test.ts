import { createMock } from 'ts-auto-mock';
import DocumentService from './DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';

describe('DocumentService', () => {
    const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const transactionId = 2;
    const documentId = 1;
    const rawDocument = {
        name: 'Document name',
        documentType: 'Bill of lading',
        externalUrl: 'externalUrl',
    };

    const mockedDocumentDriver = createMock<DocumentDriver>({
        registerDocument: jest.fn(),
        getDocumentCounter: jest.fn(),
        documentExists: jest.fn(),
        getDocumentInfo: jest.fn(),
        getTransactionDocumentIds: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });

    const documentService = new DocumentService(
        mockedDocumentDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerDocument',
            serviceFunction: () => documentService.registerDocument(owner, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl),
            expectedMockedFunction: mockedDocumentDriver.registerDocument,
            expectedMockedFunctionArgs: [owner, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl],
        },
        {
            serviceFunctionName: 'getDocumentCounter',
            serviceFunction: () => documentService.getDocumentCounter(owner),
            expectedMockedFunction: mockedDocumentDriver.getDocumentCounter,
            expectedMockedFunctionArgs: [owner],
        },
        {
            serviceFunctionName: 'documentExists',
            serviceFunction: () => documentService.documentExists(owner, transactionId, documentId),
            expectedMockedFunction: mockedDocumentDriver.documentExists,
            expectedMockedFunctionArgs: [owner, transactionId, documentId],
        },
        {
            serviceFunctionName: 'getDocumentInfo',
            serviceFunction: () => documentService.getDocumentInfo(owner, transactionId, documentId),
            expectedMockedFunction: mockedDocumentDriver.getDocumentInfo,
            expectedMockedFunctionArgs: [owner, transactionId, documentId],
        },
        {
            serviceFunctionName: 'getTransactionDocumentIds',
            serviceFunction: () => documentService.getTransactionDocumentIds(owner, transactionId),
            expectedMockedFunction: mockedDocumentDriver.getTransactionDocumentIds,
            expectedMockedFunctionArgs: [owner, transactionId],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => documentService.addAdmin('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => documentService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
