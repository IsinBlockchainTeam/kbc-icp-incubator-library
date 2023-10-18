/* eslint-disable camelcase */
import { createMock } from 'ts-auto-mock';
import { BigNumber, ethers, Signer } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { DocumentDriver } from './DocumentDriver';
import { DocumentInfo } from '../entities/DocumentInfo';
import { EntityBuilder } from '../utils/EntityBuilder';

describe('DocumentDriver', () => {
    let documentDriver: DocumentDriver;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedSigner: Signer;
    let mockedContract: DocumentManager;

    const mockedDocumentConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const transactionId = 2;
    const transactionType = 'trade';
    const documentId = 1;
    const rawDocument = {
        name: 'Document name',
        documentType: 'Bill of lading',
        externalUrl: 'externalUrl',
    };
    const mockedDocument = createMock<DocumentInfo>();

    beforeAll(() => {
        mockedWriteFunction.mockResolvedValue({
            wait: mockedWait,
        });
        mockedReadFunction.mockResolvedValue({
            toNumber: jest.fn(),
        });
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedContract = createMock<DocumentManager>({
            registerDocument: mockedWriteFunction,
            getDocumentsCounterByTransactionIdAndType: mockedReadFunction,
            documentExists: mockedReadFunction,
            getDocumentInfo: mockedReadFunction,
            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            addOrderManager: mockedWriteFunction,
            removeOrderManager: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
        });

        mockedDocumentConnect.mockReturnValue(mockedContract);
        const mockedDocumentManager = createMock<DocumentManager>({
            connect: mockedDocumentConnect,
        });
        jest.spyOn(DocumentManager__factory, 'connect').mockReturnValue(mockedDocumentManager);

        const buildDocumentSpy = jest.spyOn(EntityBuilder, 'buildDocumentInfo');
        buildDocumentSpy.mockReturnValue(mockedDocument);

        mockedSigner = createMock<Signer>();
        documentDriver = new DocumentDriver(
            mockedSigner,
            testAddress,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    describe('registerDocument', () => {
        it('should call and wait for register document', async () => {
            await documentDriver.registerDocument(transactionId, transactionType, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

            expect(mockedContract.registerDocument).toHaveBeenCalledTimes(1);
            expect(mockedContract.registerDocument).toHaveBeenNthCalledWith(1, transactionId, transactionType, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl, 0);
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register document - transaction fails', async () => {
            mockedContract.registerDocument = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.registerDocument(transactionId, transactionType, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('getDocumentCounterByTransactionId', () => {
        it('should get the document counter by transaction id', async () => {
            await documentDriver.getDocumentsCounterByTransactionIdAndType(2, transactionType);
            expect(mockedContract.getDocumentsCounterByTransactionIdAndType).toHaveBeenCalledTimes(1);
            expect(mockedContract.getDocumentsCounterByTransactionIdAndType).toHaveBeenNthCalledWith(1, 2, transactionType);
        });

        it('should retrieve document counter - transaction fails', async () => {
            mockedContract.getDocumentsCounterByTransactionIdAndType = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.getDocumentsCounterByTransactionIdAndType(2, transactionType);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('documentExists', () => {
        it('should check if document exists', async () => {
            await documentDriver.documentExists(transactionId, transactionType, documentId);
            expect(mockedContract.documentExists).toHaveBeenCalledTimes(1);
            expect(mockedContract.documentExists).toHaveBeenNthCalledWith(1, transactionId, transactionType, documentId);
        });

        it('should check if document exists - transaction fails', async () => {
            mockedContract.documentExists = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.documentExists(transactionId, transactionType, documentId);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('getDocumentInfo', () => {
        it('should retrieve document', async () => {
            mockedContract.getDocumentInfo = jest.fn().mockResolvedValue(mockedDocument);

            const resp = await documentDriver.getDocumentInfo(transactionId, transactionType, documentId);

            expect(resp).toEqual(mockedDocument);

            expect(mockedContract.getDocumentInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getDocumentInfo).toHaveBeenNthCalledWith(1, transactionId, transactionType, documentId);
        });

        it('should retrieve document - transaction fails', async () => {
            mockedContract.getDocumentInfo = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.getDocumentInfo(transactionId, transactionType, documentId);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });
    });

    describe('addAdmin', () => {
        it('should call and wait for add admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await documentDriver.addAdmin(address);

            expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.addAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add admin - fails for address', async () => {
            const address = '123';

            const fn = async () => documentDriver.addAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('removeAdmin', () => {
        it('should call and wait for remove admin', async () => {
            const { address } = ethers.Wallet.createRandom();
            await documentDriver.removeAdmin(address);

            expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
            expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for remove admin - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.removeAdmin = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for remove admin - fails for address', async () => {
            const address = '123';

            const fn = async () => documentDriver.removeAdmin(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('addOrderManager', () => {
        it('should call and wait for add order manager', async () => {
            const { address } = ethers.Wallet.createRandom();
            await documentDriver.addOrderManager(address);

            expect(mockedContract.addOrderManager).toHaveBeenCalledTimes(1);
            expect(mockedContract.addOrderManager).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for add order manager - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.addOrderManager = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.addOrderManager(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for add order manager - fails for address', async () => {
            const address = '123';

            const fn = async () => documentDriver.addOrderManager(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });

    describe('removeOrderManager', () => {
        it('should call and wait for remove order manager', async () => {
            const { address } = ethers.Wallet.createRandom();
            await documentDriver.removeOrderManager(address);

            expect(mockedContract.removeOrderManager).toHaveBeenCalledTimes(1);
            expect(mockedContract.removeOrderManager).toHaveBeenNthCalledWith(
                1,
                address,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for remove order manager - transaction fails', async () => {
            const { address } = ethers.Wallet.createRandom();
            mockedContract.removeOrderManager = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.removeOrderManager(address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for remove order manager - fails for address', async () => {
            const address = '123';

            const fn = async () => documentDriver.removeOrderManager(address);
            await expect(fn).rejects.toThrowError(new Error('Not an address'));
        });
    });
});
