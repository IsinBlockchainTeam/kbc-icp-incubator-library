import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from './BasicTradeDriver';
import { Trade as TradeContract } from '../smart-contracts/contracts/BasicTrade';
import {
    BasicTrade as BasicTradeContract,
    Trade__factory, BasicTrade__factory,
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Line, LineRequest } from '../entities/Trade';

describe('BasicTradeDriver', () => {
    let basicTradeDriver: BasicTradeDriver;
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
    const name: string = 'test trade';

    let mockedSigner: Signer;

    const mockedBasicTradeConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetTrade = jest.fn();
    const mockedGetLines = jest.fn();
    const mockedGetLine = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetTrade.mockResolvedValue(
        [BigNumber.from(tradeId), supplier, customer, commissioner, externalUrl, lineIds, name],
    );
    mockedGetLines.mockResolvedValue([line]);
    mockedGetLine.mockResolvedValue(line);

    const mockedContract = createMock<BasicTradeContract>({
        getTrade: mockedGetTrade,
        getLines: mockedGetLines,
        getLine: mockedGetLine,
        addLine: mockedWriteFunction,
        updateLine: mockedWriteFunction,
        setName: mockedWriteFunction,
    });

    beforeAll(() => {
        mockedBasicTradeConnect.mockReturnValue(mockedContract);
        const mockedBasicTradeContract = createMock<BasicTradeContract>({
            connect: mockedBasicTradeConnect,
        });
        jest.spyOn(Trade__factory, 'connect')
            .mockReturnValue(mockedBasicTradeContract);
        jest.spyOn(BasicTrade__factory, 'connect')
            .mockReturnValue(mockedBasicTradeContract);

        mockedSigner = createMock<Signer>();
        basicTradeDriver = new BasicTradeDriver(mockedSigner, contractAddress);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly retrieve the basic trade', async () => {
        const result = await basicTradeDriver.getTrade();
        const expectedMap: Map<number, Line> = new Map<number, Line>();
        expectedMap.set(line.id.toNumber(), EntityBuilder.buildTradeLine(line));

        expect(result.tradeId)
            .toEqual(tradeId);
        expect(result.supplier)
            .toEqual(supplier);
        expect(result.customer)
            .toEqual(customer);
        expect(result.commissioner)
            .toEqual(commissioner);
        expect(result.externalUrl)
            .toEqual(externalUrl);
        expect(result.lines)
            .toEqual(expectedMap);
        expect(result.name)
            .toEqual(name);

        expect(mockedContract.getTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrade)
            .toHaveBeenNthCalledWith(1, { blockTag: undefined });
        expect(mockedGetTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLines)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLines)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetLines)
            .toHaveBeenCalledTimes(1);
    });

    it('should return empty array if no lines are found', async () => {
        mockedGetLines.mockResolvedValueOnce(undefined);
        const result = await basicTradeDriver.getLines();

        expect(result).toEqual([]);
    });

    it('should correctly retrieve a line', async () => {
        const result = await basicTradeDriver.getLine(line.id.toNumber());

        expect(result.id)
            .toEqual(line.id.toNumber());
        expect(result.materialsId)
            .toEqual(line.materialsId.map((id: BigNumber) => id.toNumber()));
        expect(result.productCategory)
            .toEqual(line.productCategory);

        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id.toNumber(), { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add a new line', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [{
                event: 'TradeLineAdded',
                args: [line.id],
            }],
        });
        const newLine: LineRequest = new LineRequest([1, 2], 'category1');
        const result: Line = await basicTradeDriver.addLine(newLine);

        expect(result).toEqual(new Line(line.id.toNumber(), newLine.materialsId, newLine.productCategory));
        expect(mockedContract.addLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.addLine)
            .toHaveBeenNthCalledWith(1, newLine.materialsId, newLine.productCategory);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id, { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should update an existing line', async () => {
        const updatedLineStruct: TradeContract.LineStructOutput = {
            id: BigNumber.from(0),
            materialsId: [BigNumber.from(1), BigNumber.from(2)],
            productCategory: 'category1',
            exists: true,
        } as TradeContract.LineStructOutput;
        const updatedLine: Line = EntityBuilder.buildTradeLine(updatedLineStruct);
        mockedGetLine.mockResolvedValueOnce(updatedLineStruct);

        expect(await basicTradeDriver.updateLine(updatedLine)).toEqual(updatedLine);
        expect(mockedContract.updateLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateLine)
            .toHaveBeenNthCalledWith(1, updatedLine.id, updatedLine.materialsId, updatedLine.productCategory);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getLine)
            .toHaveBeenNthCalledWith(1, line.id.toNumber(), { blockTag: undefined });
        expect(mockedGetLine)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly set the new name', async () => {
        await basicTradeDriver.setName('new name');

        expect(mockedContract.setName)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.setName)
            .toHaveBeenNthCalledWith(1, 'new name');
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });
});
