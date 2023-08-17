/* eslint-disable camelcase */
import { createMock } from 'ts-auto-mock';
import { BigNumber, ethers, Signer } from 'ethers';
import { DocumentManager, DocumentManager__factory } from '../smart-contracts';
import { DocumentDriver } from './DocumentDriver';
import { Document } from '../entities/Document';
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

    const owner = ethers.Wallet.createRandom();
    const transactionId = 2;
    const documentId = 1;
    const rawDocument = {
        name: 'Document name',
        documentType: 'Bill of lading',
        externalUrl: 'externalUrl',
    };
    const mockedDocument = createMock<Document>();

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
            getDocumentCounter: mockedReadFunction,
            documentExists: mockedReadFunction,
            getDocumentInfo: mockedReadFunction,
            getTransactionDocumentIds: mockedReadFunction,
            addAdmin: mockedWriteFunction,
            removeAdmin: mockedWriteFunction,
            interface: { decodeEventLog: mockedDecodeEventLog },
        });

        mockedDocumentConnect.mockReturnValue(mockedContract);
        const mockedDocumentManager = createMock<DocumentManager>({
            connect: mockedDocumentConnect,
        });
        jest.spyOn(DocumentManager__factory, 'connect').mockReturnValue(mockedDocumentManager);

        const buildDocumentSpy = jest.spyOn(EntityBuilder, 'buildDocument');
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
            await documentDriver.registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);

            expect(mockedContract.registerDocument).toHaveBeenCalledTimes(1);
            expect(mockedContract.registerDocument).toHaveBeenNthCalledWith(
                1,
                owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl,
            );
            expect(mockedWait).toHaveBeenCalledTimes(1);
        });

        it('should call and wait for register document - transaction fails', async () => {
            mockedContract.registerDocument = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.registerDocument(owner.address, transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should call and wait for register document - FAIL (Owner not an address)', async () => {
            const fn = async () => documentDriver.registerDocument('0xaddress', transactionId, rawDocument.name, rawDocument.documentType, rawDocument.externalUrl);
            await expect(fn).rejects.toThrowError(new Error('Owner not an address'));
        });
    });

    describe('getDocumentCounter', () => {
        it('should get the document counter ids', async () => {
            await documentDriver.getDocumentCounter(owner.address);
            expect(mockedContract.getDocumentCounter).toHaveBeenCalledTimes(1);
            expect(mockedContract.getDocumentCounter).toHaveBeenNthCalledWith(1, owner.address);
        });

        it('should retrieve document - transaction fails', async () => {
            mockedContract.getDocumentCounter = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.getDocumentCounter(owner.address);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should get the document counter ids - FAIL (Owner not an address)', async () => {
            const fn = async () => documentDriver.getDocumentCounter('0xaddress');
            await expect(fn).rejects.toThrowError(new Error('Owner not an address'));
        });
    });

    describe('documentExists', () => {
        it('should check if document exists', async () => {
            await documentDriver.documentExists(owner.address, transactionId, documentId);
            expect(mockedContract.documentExists).toHaveBeenCalledTimes(1);
            expect(mockedContract.documentExists).toHaveBeenNthCalledWith(1, owner.address, transactionId, documentId);
        });

        it('should check if document exists - transaction fails', async () => {
            mockedContract.documentExists = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.documentExists(owner.address, transactionId, documentId);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should check if document exists - FAIL (Owner not an address)', async () => {
            const fn = async () => documentDriver.documentExists('0xaddress', transactionId, documentId);
            await expect(fn).rejects.toThrowError(new Error('Owner not an address'));
        });
    });

    describe('getDocumentInfo', () => {
        it('should retrieve document', async () => {
            mockedContract.getDocumentInfo = jest.fn().mockResolvedValue(mockedDocument);

            const resp = await documentDriver.getDocumentInfo(owner.address, transactionId, documentId);

            expect(resp).toEqual(mockedDocument);

            expect(mockedContract.getDocumentInfo).toHaveBeenCalledTimes(1);
            expect(mockedContract.getDocumentInfo).toHaveBeenNthCalledWith(
                1,
                owner.address, transactionId, documentId,
            );
        });

        it('should retrieve document - transaction fails', async () => {
            mockedContract.getDocumentInfo = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.getDocumentInfo(owner.address, transactionId, documentId);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve document - FAIL (Owner not an address)', async () => {
            const fn = async () => documentDriver.getDocumentInfo('0xaddress', transactionId, documentId);
            await expect(fn).rejects.toThrowError(new Error('Owner not an address'));
        });
    });

    describe('getTransactionDocumentIds', () => {
        it('should retrieve document ids by owner address and transaction id', async () => {
            mockedContract.getTransactionDocumentIds = jest.fn().mockResolvedValue([{ toNumber: () => 1 }, { toNumber: () => 2 }]);

            const resp = await documentDriver.getTransactionDocumentIds(owner.address, transactionId);
            expect(resp).toEqual([1, 2]);
            expect(mockedContract.getTransactionDocumentIds).toHaveBeenCalledTimes(1);
            expect(mockedContract.getTransactionDocumentIds).toHaveBeenNthCalledWith(1, owner.address, transactionId);
        });

        it('should retrieve document ids by company address - transaction fails', async () => {
            mockedContract.getTransactionDocumentIds = jest.fn().mockRejectedValue(new Error(errorMessage));

            const fn = async () => documentDriver.getTransactionDocumentIds(owner.address, transactionId);
            await expect(fn).rejects.toThrowError(new Error(errorMessage));
        });

        it('should retrieve document ids by company address - FAIL (Owner not an address)', async () => {
            const fn = async () => documentDriver.getTransactionDocumentIds('0xaddress', transactionId);
            await expect(fn).rejects.toThrowError(new Error('Owner not an address'));
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
});
