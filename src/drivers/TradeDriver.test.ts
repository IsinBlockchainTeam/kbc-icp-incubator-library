import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { TradeDriver } from './TradeDriver';
import { Trade as TradeContract, Trade__factory } from '../smart-contracts';
import { DocumentType } from '../entities/DocumentInfo';
import { TradeType } from '../types/TradeType';
import { DocumentStatus } from '../entities/Document';
import { RoleProof } from '../types/RoleProof';

describe('TradeDriver', () => {
    let tradeDriver: TradeDriver;
    const contractAddress: string = Wallet.createRandom().address;

    const roleProof: RoleProof = {
        signedProof: 'signedProof',
        delegator: 'delegator'
    };

    const lineIds: BigNumber[] = [BigNumber.from(1)];

    let mockedSigner: Signer;

    const mockedTradeConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetLineCounter = jest.fn();
    const mockedGetTradeType = jest.fn();
    const mockedGetLineExists = jest.fn();
    const mockedGetAllDocumentIds = jest.fn();
    const mockedGetAllDocumentIdsByType = jest.fn();
    const mockedGetDocumentStatus = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });
    mockedGetLineCounter.mockReturnValue(BigNumber.from(lineIds.length));
    mockedGetTradeType.mockResolvedValue(TradeType.BASIC);
    mockedGetLineExists.mockResolvedValue(true);

    const mockedContract = createMock<TradeContract>({
        getLineCounter: mockedGetLineCounter,
        getTradeType: mockedGetTradeType,
        getLineExists: mockedGetLineExists,
        addDocument: mockedWriteFunction,
        updateDocument: mockedWriteFunction,
        validateDocument: mockedWriteFunction,
        getAllDocumentIds: mockedGetAllDocumentIds,
        getDocumentIdsByType: mockedGetAllDocumentIdsByType,
        getDocumentStatus: mockedGetDocumentStatus
    });

    beforeAll(() => {
        mockedTradeConnect.mockReturnValue(mockedContract);
        const mockedTradeContract: TradeContract = createMock<TradeContract>({
            connect: mockedTradeConnect
        });
        jest.spyOn(Trade__factory, 'connect').mockReturnValue(mockedTradeContract);

        mockedSigner = createMock<Signer>();
        tradeDriver = new TradeDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve trade counter', async () => {
        expect(await tradeDriver.getLineCounter(roleProof)).toEqual(1);

        expect(mockedContract.getLineCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineCounter).toHaveBeenNthCalledWith(1, roleProof);
    });

    it('should correctly retrieve trade type - BASIC', async () => {
        expect(await tradeDriver.getTradeType(roleProof)).toEqual(TradeType.BASIC);
    });

    it('should correctly retrieve trade type - ORDER', async () => {
        mockedGetTradeType.mockResolvedValueOnce(TradeType.ORDER);

        expect(await tradeDriver.getTradeType(roleProof)).toEqual(TradeType.ORDER);
    });

    it('should correctly retrieve trade type - FAIL(Utils: an invalid value "..." for "TradeType" was returned by the contract)', async () => {
        mockedGetTradeType.mockResolvedValueOnce(42);
        await expect(tradeDriver.getTradeType(roleProof)).rejects.toThrow(
            new Error('Utils: an invalid value "42" for "TradeType" was returned by the contract')
        );
    });

    it('should correctly retrieve line exists', async () => {
        const response = await tradeDriver.getLineExists(roleProof, lineIds[0].toNumber());

        expect(response).toEqual(true);

        expect(mockedContract.getLineExists).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineExists).toHaveBeenNthCalledWith(
            1,
            roleProof,
            lineIds[0].toNumber()
        );
        expect(mockedGetLineExists).toHaveBeenCalledTimes(1);
    });

    it('should correctly add a document', async () => {
        await tradeDriver.addDocument(
            roleProof,
            DocumentType.BILL_OF_LADING,
            'https://test.com',
            'contentHash'
        );

        expect(mockedContract.addDocument).toHaveBeenCalledTimes(1);
        expect(mockedContract.addDocument).toHaveBeenNthCalledWith(
            1,
            roleProof,
            DocumentType.BILL_OF_LADING,
            'https://test.com',
            'contentHash'
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update a document', async () => {
        await tradeDriver.updateDocument(roleProof, 1, 'https://test.com', 'contentHash');

        expect(mockedContract.updateDocument).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateDocument).toHaveBeenNthCalledWith(
            1,
            roleProof,
            1,
            'https://test.com',
            'contentHash'
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly validate a document', async () => {
        await tradeDriver.validateDocument(roleProof, 1, DocumentStatus.APPROVED);

        expect(mockedContract.validateDocument).toHaveBeenCalledTimes(1);
        expect(mockedContract.validateDocument).toHaveBeenNthCalledWith(
            1,
            roleProof,
            1,
            DocumentStatus.APPROVED
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve document ids by type', async () => {
        const documentIds: number[] = [1, 2, 3];

        mockedGetAllDocumentIdsByType.mockResolvedValueOnce(
            documentIds.map((id) => BigNumber.from(id))
        );

        const response = await tradeDriver.getDocumentIdsByType(
            roleProof,
            DocumentType.BILL_OF_LADING
        );
        expect(response).toEqual(documentIds);

        expect(mockedContract.getDocumentIdsByType).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDocumentIdsByType).toHaveBeenNthCalledWith(
            1,
            roleProof,
            DocumentType.BILL_OF_LADING
        );
    });

    it('should correctly retrieve document ids', async () => {
        const documentIds: number[] = [1, 2, 3];

        mockedGetAllDocumentIds.mockResolvedValueOnce(documentIds.map((id) => BigNumber.from(id)));

        const response = await tradeDriver.getAllDocumentIds(roleProof);
        expect(response).toEqual(documentIds);

        expect(mockedContract.getAllDocumentIds).toHaveBeenCalledTimes(1);
        expect(mockedContract.getAllDocumentIds).toHaveBeenNthCalledWith(1, roleProof);
    });

    it('should get document status', async () => {
        mockedGetDocumentStatus.mockResolvedValueOnce(DocumentStatus.NOT_EVALUATED);
        expect(await tradeDriver.getDocumentStatus(roleProof, 1)).toEqual(
            DocumentStatus.NOT_EVALUATED
        );

        mockedGetDocumentStatus.mockResolvedValueOnce(DocumentStatus.NOT_APPROVED);
        expect(await tradeDriver.getDocumentStatus(roleProof, 1)).toEqual(
            DocumentStatus.NOT_APPROVED
        );

        mockedGetDocumentStatus.mockResolvedValueOnce(DocumentStatus.APPROVED);
        expect(await tradeDriver.getDocumentStatus(roleProof, 1)).toEqual(DocumentStatus.APPROVED);

        mockedGetDocumentStatus.mockResolvedValueOnce(40);
        await expect(tradeDriver.getDocumentStatus(roleProof, 1)).rejects.toThrow(
            new Error('Invalid document status')
        );

        expect(mockedContract.getDocumentStatus).toHaveBeenCalledTimes(4);
    });
});
