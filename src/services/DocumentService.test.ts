import { createMock } from 'ts-auto-mock';
import { SolidStorageACR } from '@blockchain-lib/common';
import DocumentService from './DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { IStorageMetadataDriver } from '../drivers/IStorageMetadataDriver';
import { SolidMetadataSpec } from '../drivers/SolidMetadataDriver';
import { IStorageDocumentDriver } from '../drivers/IStorageDocumentDriver';
import { SolidDocumentSpec } from '../drivers/SolidDocumentDriver';
import { StorageOperationType } from '../types/StorageOperationType';

describe('DocumentService', () => {
    const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const transactionId = 2;
    const documentId = 1;
    const rawDocument = {
        name: 'Document name',
        documentType: DocumentType.BILL_OF_LADING,
        externalUrl: 'externalUrl',
        contentHash: 'contentHash',
    };
    const transactionType = 'trade';

    const mockedDocumentDriver = createMock<DocumentDriver>({
        registerDocument: jest.fn(),
        getDocumentsCounter: jest.fn(),
        getDocumentById: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
        addTradeManager: jest.fn(),
        removeTradeManager: jest.fn(),
    });
    const mockedStorageMetadataDriver = createMock<IStorageMetadataDriver<SolidMetadataSpec, SolidStorageACR>>(
        { create: jest.fn(), read: jest.fn() },
    );
    const metadataSpec: SolidMetadataSpec = {
        entireResourceUrl: 'metadataExternalUrl',
    };
    const mockedStorageDocumentDriver = createMock<IStorageDocumentDriver<SolidDocumentSpec>>(
        { create: jest.fn(), read: jest.fn() },
    );
    const documentSpec: SolidDocumentSpec = {
        entireResourceUrl: 'fileUrl',
    };

    let documentService = new DocumentService(
        { documentDriver: mockedDocumentDriver },
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerDocument',
            serviceFunction: () => documentService.registerDocument(rawDocument.externalUrl, rawDocument.contentHash),
            expectedMockedFunction: mockedDocumentDriver.registerDocument,
            expectedMockedFunctionArgs: [rawDocument.externalUrl, rawDocument.contentHash],
        },
        {
            serviceFunctionName: 'getDocumentsCounter',
            serviceFunction: () => documentService.getDocumentsCounter(),
            expectedMockedFunction: mockedDocumentDriver.getDocumentsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getDocumentInfoById',
            serviceFunction: () => documentService.getDocumentInfoById(3),
            expectedMockedFunction: mockedDocumentDriver.getDocumentById,
            expectedMockedFunctionArgs: [3],
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
            serviceFunctionName: 'addTradeManager',
            serviceFunction: () => documentService.addTradeManager('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.addTradeManager,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeTradeManager',
            serviceFunction: () => documentService.removeTradeManager('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.removeTradeManager,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it('should get complete document with file retrieved from external storage', async () => {
        documentService = new DocumentService({
            documentDriver: mockedDocumentDriver,
            storageDocumentDriver: mockedStorageDocumentDriver,
            storageMetadataDriver: mockedStorageMetadataDriver,
        });
        mockedStorageMetadataDriver.read = jest.fn().mockResolvedValue({ filename: 'file1.pdf', date: new Date(), transactionLines: [] });
        const documentInfo = new DocumentInfo(0, 'metadataExternalUrl', rawDocument.contentHash);
        await documentService.getCompleteDocument(documentInfo, metadataSpec, documentSpec);

        expect(mockedStorageMetadataDriver.read).toHaveBeenCalledTimes(1);
        expect(mockedStorageMetadataDriver.read).toHaveBeenNthCalledWith(1, StorageOperationType.TRANSACTION_DOCUMENT, metadataSpec);

        expect(mockedStorageDocumentDriver.read).toHaveBeenCalledTimes(1);
        expect(mockedStorageDocumentDriver.read).toHaveBeenNthCalledWith(1, StorageOperationType.TRANSACTION_DOCUMENT, documentSpec);
    });

    it('should get complete document with file retrieved from external storage - FAIL', async () => {
        documentService = new DocumentService({
            documentDriver: mockedDocumentDriver,
            storageDocumentDriver: mockedStorageDocumentDriver,
            storageMetadataDriver: mockedStorageMetadataDriver,
        });
        mockedStorageMetadataDriver.read = jest.fn().mockRejectedValueOnce(new Error('error'));
        const documentInfo = new DocumentInfo(0, 'metadataExternalUrl', rawDocument.contentHash);

        const fn = async () => documentService.getCompleteDocument(documentInfo, metadataSpec, documentSpec);
        await expect(fn).rejects.toThrow(new Error('Error while retrieve document file from external storage: error'));
    });

    it('should throw error if try to get complete document with file retrieved from external storage, without passing storage drivers to constructor', async () => {
        documentService = new DocumentService({
            documentDriver: mockedDocumentDriver,
        });
        let documentInfo = new DocumentInfo(0, 'metadataExternalUrl', rawDocument.contentHash);
        let fn = async () => documentService.getCompleteDocument(documentInfo, metadataSpec, documentSpec);
        await expect(fn).rejects.toThrow(new Error('Storage document driver is not available'));

        documentService = new DocumentService({
            documentDriver: mockedDocumentDriver,
            storageDocumentDriver: mockedStorageDocumentDriver,
        });
        documentInfo = new DocumentInfo(0, 'metadataExternalUrl', rawDocument.contentHash);
        fn = async () => documentService.getCompleteDocument(documentInfo, metadataSpec, documentSpec);
        await expect(fn).rejects.toThrow(new Error('Storage metadata driver is not available'));
    });
});
