import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from './BasicTradeDriver';
import {
    Trade as TradeContract,
    BasicTrade as BasicTradeContract,
    Trade__factory, BasicTrade__factory,
} from '../smart-contracts';

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
    const mockedGetBasicTrade = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetBasicTrade.mockReturnValue(Promise.resolve(
        [BigNumber.from(tradeId), supplier, customer, commissioner, externalUrl, lineIds, name],
    ));

    const mockedContract = createMock<BasicTradeContract>({
        getBasicTrade: mockedGetBasicTrade,
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
        const result = await basicTradeDriver.getBasicTrade();

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
        expect(result.lineIds)
            .toEqual(lineIds.map((value: BigNumber) => value.toNumber()));
        expect(result.name)
            .toEqual(name);

        expect(mockedContract.getBasicTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getBasicTrade)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetBasicTrade)
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
