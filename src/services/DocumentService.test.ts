import { createMock } from 'ts-auto-mock';
import { TextEncoder } from 'util';
import DocumentService from './DocumentService';
import { DocumentDriver } from '../drivers/DocumentDriver';
import { DocumentInfo, DocumentType } from '../entities/DocumentInfo';
import { ICPFileDriver } from '../drivers/ICPFileDriver';
import { RoleProof } from '../types/RoleProof';

describe('DocumentService', () => {
    const owner = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const rawDocument = {
        name: 'Document name',
        documentType: DocumentType.BILL_OF_LADING,
        externalUrl: 'externalUrl',
        contentHash: 'contentHash',
        uploadedBy: owner
    };

    const mockedDocumentDriver = createMock<DocumentDriver>({
        registerDocument: jest.fn(),
        updateDocument: jest.fn(),
        getDocumentsCounter: jest.fn(),
        getDocumentById: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
        addTradeManager: jest.fn(),
        removeTradeManager: jest.fn()
    });
    const mockedIcpFileDriver: ICPFileDriver = createMock<ICPFileDriver>({
        read: jest.fn()
    });

    let documentService = new DocumentService(mockedDocumentDriver, mockedIcpFileDriver);

    const roleProof: RoleProof = createMock<RoleProof>();

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerDocument',
            serviceFunction: () =>
                documentService.registerDocument(
                    roleProof,
                    rawDocument.externalUrl,
                    rawDocument.contentHash
                ),
            expectedMockedFunction: mockedDocumentDriver.registerDocument,
            expectedMockedFunctionArgs: [
                roleProof,
                rawDocument.externalUrl,
                rawDocument.contentHash
            ]
        },
        {
            serviceFunctionName: 'updateDocument',
            serviceFunction: () =>
                documentService.updateDocument(
                    roleProof,
                    1,
                    rawDocument.externalUrl,
                    rawDocument.contentHash,
                    rawDocument.uploadedBy
                ),
            expectedMockedFunction: mockedDocumentDriver.updateDocument,
            expectedMockedFunctionArgs: [
                roleProof,
                1,
                rawDocument.externalUrl,
                rawDocument.contentHash,
                rawDocument.uploadedBy
            ]
        },
        {
            serviceFunctionName: 'getDocumentsCounter',
            serviceFunction: () => documentService.getDocumentsCounter(roleProof),
            expectedMockedFunction: mockedDocumentDriver.getDocumentsCounter,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getDocumentInfoById',
            serviceFunction: () => documentService.getDocumentInfoById(roleProof, 3),
            expectedMockedFunction: mockedDocumentDriver.getDocumentById,
            expectedMockedFunctionArgs: [roleProof, 3]
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => documentService.addAdmin('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => documentService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress']
        },
        {
            serviceFunctionName: 'addTradeManager',
            serviceFunction: () => documentService.addTradeManager('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.addTradeManager,
            expectedMockedFunctionArgs: ['testAddress']
        },
        {
            serviceFunctionName: 'removeTradeManager',
            serviceFunction: () => documentService.removeTradeManager('testAddress'),
            expectedMockedFunction: mockedDocumentDriver.removeTradeManager,
            expectedMockedFunctionArgs: ['testAddress']
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

    it('should get complete document with file retrieved from external storage', async () => {
        documentService = new DocumentService(mockedDocumentDriver, mockedIcpFileDriver);
        mockedIcpFileDriver.read = jest.fn().mockResolvedValue(
            new TextEncoder().encode(
                JSON.stringify({
                    filename: 'file1.pdf',
                    date: new Date(),
                    documentType: DocumentType.BILL_OF_LADING,
                    transactionLines: []
                })
            )
        );
        const documentInfo = new DocumentInfo(
            0,
            'file/path/resource.pdf',
            rawDocument.contentHash,
            rawDocument.uploadedBy
        );
        await documentService.getCompleteDocument(documentInfo);

        expect(mockedIcpFileDriver.read).toHaveBeenCalledTimes(2);
        expect(mockedIcpFileDriver.read).toHaveBeenNthCalledWith(
            1,
            `file/path/resource-metadata.json`
        );
        expect(mockedIcpFileDriver.read).toHaveBeenNthCalledWith(2, documentInfo.externalUrl);
    });

    it('should get complete document with file retrieved from external storage - FAIL(Error while retrieving document metadata from external storage: missing fields)', async () => {
        documentService = new DocumentService(mockedDocumentDriver, mockedIcpFileDriver);
        mockedIcpFileDriver.read = jest.fn().mockResolvedValue(
            new TextEncoder().encode(
                JSON.stringify({
                    filename: 'file1.pdf',
                    date: new Date(),
                    transactionLines: []
                })
            )
        );
        await expect(
            documentService.getCompleteDocument(
                new DocumentInfo(
                    0,
                    'file/path/resource.pdf',
                    rawDocument.contentHash,
                    rawDocument.uploadedBy
                )
            )
        ).rejects.toThrow(
            new Error('Error while retrieving document file from external storage: Missing fields')
        );
    });

    it('should get complete document with file retrieved from external storage - FAIL(Error while retrieving document file from external storage)', async () => {
        documentService = new DocumentService(mockedDocumentDriver, mockedIcpFileDriver);
        mockedIcpFileDriver.read = jest.fn().mockRejectedValueOnce(new Error('error'));
        await expect(
            documentService.getCompleteDocument(
                new DocumentInfo(
                    0,
                    'file/path/resource.pdf',
                    rawDocument.contentHash,
                    rawDocument.uploadedBy
                )
            )
        ).rejects.toThrow(
            new Error('Error while retrieving document file from external storage: error')
        );
    });
});
