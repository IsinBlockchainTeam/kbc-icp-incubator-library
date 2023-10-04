import { createMock } from 'ts-auto-mock';
import { IPFSService } from '@blockchain-lib/common';
import DocumentService from './DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo } from '../entities/DocumentInfo';

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
        getDocumentsCounterByTransactionId: jest.fn(),
        documentExists: jest.fn(),
        getDocumentInfo: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
        addOrderManager: jest.fn(),
        removeOrderManager: jest.fn(),
    });
    const mockedIPFSService = createMock<IPFSService>({
        retrieveJSON: jest.fn(),
        retrieveFile: jest.fn(),
    });

    let documentService = new DocumentService(
        mockedDocumentDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerDocument',
            serviceFunction: () => documentService.registerDocument(transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl),
            expectedMockedFunction: mockedDocumentDriver.registerDocument,
            expectedMockedFunctionArgs: [transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl],
        },
        {
            serviceFunctionName: 'documentExists',
            serviceFunction: () => documentService.documentExists(transactionId, documentId),
            expectedMockedFunction: mockedDocumentDriver.documentExists,
            expectedMockedFunctionArgs: [transactionId, documentId],
        },
        {
            serviceFunctionName: 'getDocumentInfo',
            serviceFunction: () => documentService.getDocumentInfo(transactionId, documentId),
            expectedMockedFunction: mockedDocumentDriver.getDocumentInfo,
            expectedMockedFunctionArgs: [transactionId, documentId],
        },
        {
            serviceFunctionName: 'getDocumentsCounterByTransactionId',
            serviceFunction: () => documentService.getDocumentsCounterByTransactionId(transactionId),
            expectedMockedFunction: mockedDocumentDriver.getDocumentsCounterByTransactionId,
            expectedMockedFunctionArgs: [transactionId],
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
        {
            serviceFunctionName: 'addOrderManager',
            serviceFunction: () => documentService.addOrderManager('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.addOrderManager,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeOrderManager',
            serviceFunction: () => documentService.removeOrderManager('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.removeOrderManager,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it('should get documents info by transaction', async () => {
        mockedDocumentDriver.getDocumentsCounterByTransactionId = jest.fn().mockResolvedValue([1, 2]);
        await documentService.getDocumentsInfoByTransaction(transactionId);

        expect(mockedDocumentDriver.getDocumentsCounterByTransactionId).toHaveBeenCalledTimes(1);
        expect(mockedDocumentDriver.getDocumentsCounterByTransactionId).toHaveBeenNthCalledWith(1, transactionId);

        expect(mockedDocumentDriver.getDocumentInfo).toHaveBeenCalledTimes(2);
        expect(mockedDocumentDriver.getDocumentInfo).toHaveBeenNthCalledWith(1, transactionId, 1);
        expect(mockedDocumentDriver.getDocumentInfo).toHaveBeenNthCalledWith(2, transactionId, 2);
    });

    it('should get complete document with file retrieved from IPFS', async () => {
        documentService = new DocumentService(
            mockedDocumentDriver, mockedIPFSService,
        );
        mockedIPFSService.retrieveJSON = jest.fn().mockResolvedValue({ filename: 'file1.pdf', fileUrl: 'fileUrl' });
        const documentInfo = new DocumentInfo(0, 1, 'doc name', 'doc type', 'metadataExternalUrl');
        await documentService.getCompleteDocument(documentInfo);

        expect(mockedIPFSService.retrieveJSON).toHaveBeenCalledTimes(1);
        expect(mockedIPFSService.retrieveJSON).toHaveBeenNthCalledWith(1, documentInfo.externalUrl);

        expect(mockedIPFSService.retrieveFile).toHaveBeenCalledTimes(1);
        expect(mockedIPFSService.retrieveFile).toHaveBeenNthCalledWith(1, 'fileUrl');
    });

    it('should throw error if try to get complete document with file retrieved from IPFS, without passing ipfs service to constructor', async () => {
        documentService = new DocumentService(
            mockedDocumentDriver,
        );
        const documentInfo = new DocumentInfo(0, 1, 'doc name', 'doc type', 'metadataExternalUrl');
        const fn = async () => documentService.getCompleteDocument(documentInfo);
        await expect(fn).rejects.toThrowError(new Error('IPFS Service not available'));
    });
});
