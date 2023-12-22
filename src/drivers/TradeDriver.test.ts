import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { TradeDriver } from './TradeDriver';
import { Trade as TradeContract, Trade__factory } from '../smart-contracts';
import { TradeStatus } from '../types/TradeStatus';
import { DocumentType } from '../entities/DocumentInfo';
import { Line } from '../entities/Trade';
import { EntityBuilder } from '../utils/EntityBuilder';
import { TradeType } from '../types/TradeType';

describe('TradeDriver', () => {
    let tradeDriver: TradeDriver;
    const contractAddress: string = Wallet.createRandom().address;

    const tradeId: number = 1;
    const supplier: string = Wallet.createRandom().address;
    const customer: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const externalUrl: string = 'externalUrl';
    const line: TradeContract.LineStructOutput = {
        id: BigNumber.from(0),
        materialsId: [BigNumber.from(1), BigNumber.from(2)],
        productCategory: 'category1',
        exists: true,
    } as TradeContract.LineStructOutput;
    const lineIds: BigNumber[] = [BigNumber.from(line.id)];
    const newAdmin: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedTradeConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetTrade = jest.fn();
    const mockedGetLines = jest.fn();
    const mockedGetLine = jest.fn();
    const mockedGetTradeType = jest.fn();
    const mockedGetLineExists = jest.fn();
    const mockedGetTradeStatus = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetTrade.mockResolvedValue(
        [BigNumber.from(tradeId), supplier, customer, commissioner, externalUrl, lineIds],
    );
    mockedGetLines.mockResolvedValue([line]);
    mockedGetLine.mockResolvedValue(line);
    mockedGetTradeType.mockResolvedValue(TradeType.BASIC);
    mockedGetLineExists.mockResolvedValue(true);
    mockedGetTradeStatus.mockResolvedValue(TradeStatus.SHIPPED);

    const mockedContract = createMock<TradeContract>({
        getTrade: mockedGetTrade,
        getTradeType: mockedGetTradeType,
        getLines: mockedGetLines,
        getLine: mockedGetLine,
        getLineExists: mockedGetLineExists,
        addLine: mockedWriteFunction,
        updateLine: mockedWriteFunction,
        getTradeStatus: mockedGetTradeStatus,
        addDocument: mockedWriteFunction,
        addAdmin: mockedWriteFunction,
        removeAdmin: mockedWriteFunction,
    });

    beforeAll(() => {
        mockedTradeConnect.mockReturnValue(mockedContract);
        const mockedTradeContract: TradeContract = createMock<TradeContract>({
            connect: mockedTradeConnect,
        });
        jest.spyOn(Trade__factory, 'connect')
            .mockReturnValue(mockedTradeContract);

        mockedSigner = createMock<Signer>();
        tradeDriver = new TradeDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve trade', async () => {
        const response = await tradeDriver.getTrade();

        expect(response.tradeId)
            .toEqual(tradeId);
        expect(response.supplier)
            .toEqual(supplier);
        expect(response.customer)
            .toEqual(customer);
        expect(response.commissioner)
            .toEqual(commissioner);
        expect(response.externalUrl)
            .toEqual(externalUrl);
        expect(response.lineIds)
            .toEqual(lineIds.map((value) => value.toNumber()));

        expect(mockedContract.getTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrade)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTrade)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve trade type - BASIC', async () => {
        expect(await tradeDriver.getTradeType())
            .toEqual(TradeType.BASIC);
    });

    it('should correctly retrieve trade type - ORDER', async () => {
        mockedGetTradeType.mockResolvedValueOnce(TradeType.ORDER);

        expect(await tradeDriver.getTradeType())
            .toEqual(TradeType.ORDER);
    });

    it('should correctly retrieve trade type - FAIL(TradeDriver: an invalid value "..." for "TradeType" was returned by the contract)', async () => {
        mockedGetTradeType.mockResolvedValueOnce(42);
        await expect(tradeDriver.getTradeType())
            .rejects
            .toThrow(new Error('TradeDriver: an invalid value "42" for "TradeType" was returned by the contract'));
    });

    it('should correctly retrieve lines', async () => {
        const response: Line[] = await tradeDriver.getLines();

        expect(response)
            .toEqual([EntityBuilder.buildTradeLine(line)]);

        expect(mockedContract.getLines)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLines)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetLines)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve line', async () => {
        const response: Line = await tradeDriver.getLine(lineIds[0].toNumber());

        expect(response)
            .toEqual(EntityBuilder.buildTradeLine(line));

        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, lineIds[0].toNumber());
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve line exists', async () => {
        const response = await tradeDriver.getLineExists(lineIds[0].toNumber());

        expect(response)
            .toEqual(true);

        expect(mockedContract.getLineExists)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLineExists)
            .toHaveBeenNthCalledWith(1, lineIds[0].toNumber());
        expect(mockedGetLineExists)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add a line', async () => {
        await tradeDriver.addLine([0, 1], 'test category');

        expect(mockedContract.addLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.addLine)
            .toHaveBeenNthCalledWith(1, [0, 1], 'test category');
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update a line', async () => {
        await tradeDriver.updateLine(1, [0, 1], 'test category');

        expect(mockedContract.updateLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateLine)
            .toHaveBeenNthCalledWith(1, 1, [0, 1], 'test category');
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the trade status  - SHIPPED', async () => {
        const response = await tradeDriver.getTradeStatus();

        expect(response)
            .toEqual(TradeStatus.SHIPPED);

        expect(mockedContract.getTradeStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradeStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTradeStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the trade status - ON_BOARD', async () => {
        mockedGetTradeStatus.mockReturnValue(Promise.resolve(TradeStatus.ON_BOARD));
        const response = await tradeDriver.getTradeStatus();

        expect(response)
            .toEqual(TradeStatus.ON_BOARD);

        expect(mockedContract.getTradeStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradeStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTradeStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the trade status - CONTRACTING', async () => {
        mockedGetTradeStatus.mockReturnValue(Promise.resolve(TradeStatus.CONTRACTING));
        const response = await tradeDriver.getTradeStatus();

        expect(response)
            .toEqual(TradeStatus.CONTRACTING);

        expect(mockedContract.getTradeStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradeStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTradeStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve the trade status - FAIL(TradeDriver: an invalid value "..." for "TradeStatus" was returned by the contract)', async () => {
        mockedGetTradeStatus.mockReturnValue(Promise.resolve(42));
        await expect(tradeDriver.getTradeStatus())
            .rejects
            .toThrow(new Error('TradeDriver: an invalid value "42" for "TradeStatus" was returned by the contract'));

        expect(mockedContract.getTradeStatus)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradeStatus)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTradeStatus)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add a document', async () => {
        await tradeDriver.addDocument('Test document', DocumentType.BILL_OF_LADING, 'https://test.com');

        expect(mockedContract.addDocument)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.addDocument)
            .toHaveBeenNthCalledWith(1, 'Test document', DocumentType.BILL_OF_LADING, 'https://test.com');
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add an admin', async () => {
        await tradeDriver.addAdmin(newAdmin);

        expect(mockedContract.addAdmin)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.addAdmin)
            .toHaveBeenNthCalledWith(1, newAdmin);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly remove an admin', async () => {
        await tradeDriver.removeAdmin(newAdmin);

        expect(mockedContract.removeAdmin)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.removeAdmin)
            .toHaveBeenNthCalledWith(1, newAdmin);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });
});
