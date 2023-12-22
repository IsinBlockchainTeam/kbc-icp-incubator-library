import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { TradeManagerDriver } from './TradeManagerDriver';
import { TradeManager, TradeManager__factory } from '../smart-contracts';
import { TradeType } from '../types/TradeType';

import * as utilsModule from '../utils/utils';

describe('TradeManagerDriver', () => {
    let tradeManagerDriver: TradeManagerDriver;
    const contractAddress: string = Wallet.createRandom().address;
    const supplier: string = Wallet.createRandom().address;
    const customer: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const externalUrl: string = 'http://external.url';
    const name: string = 'name';
    const paymentDeadline: number = 1;
    const documentDeliveryDeadline: number = 2;
    const arbiter: string = 'arbiter';
    const shippingDeadline: number = 3;
    const deliveryDeadline: number = 4;
    const agreedAmount: number = 5;
    const tokenAddress: string = Wallet.createRandom().address;
    const mockedContractAddress: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedTradeManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetTrades = jest.fn();
    const mockedGetTradesAndTypes = jest.fn();
    const mockedGetTrade = jest.fn();
    const mockedGetTradeIdsOfEntity = jest.fn();

    const getTradeTypeByIndexSpy = jest.spyOn(utilsModule, 'getTradeTypeByIndex');
    getTradeTypeByIndexSpy.mockReturnValue(TradeType.BASIC);

    const mockEvents = [
        {
            event: 'BasicTradeRegistered',
            args: { id: BigNumber.from(0) },
        },
        {
            event: 'OrderTradeRegistered',
            args: { id: BigNumber.from(1) },
        },
    ];
    mockedWait.mockResolvedValue({
        events: mockEvents,
    });
    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetTrades.mockResolvedValue([mockedContractAddress]);
    mockedGetTradesAndTypes.mockResolvedValue([
        [mockedContractAddress],
        [BigNumber.from(0)],
    ]);
    mockedGetTrade.mockResolvedValue(mockedContractAddress);
    mockedGetTradeIdsOfEntity.mockResolvedValue([BigNumber.from(0)]);

    const mockedContract = createMock<TradeManager>({
        registerBasicTrade: mockedWriteFunction,
        registerOrderTrade: mockedWriteFunction,
        getTrades: mockedGetTrades,
        getTradesAndTypes: mockedGetTradesAndTypes,
        getTrade: mockedGetTrade,
        getTradeIdsOfSupplier: mockedGetTradeIdsOfEntity,
        getTradeIdsOfCommissioner: mockedGetTradeIdsOfEntity,
    });

    beforeAll(() => {
        mockedTradeManagerConnect.mockReturnValue(mockedContract);
        const mockedTradeManager = createMock<TradeManager>({
            connect: mockedTradeManagerConnect,
        });
        jest.spyOn(TradeManager__factory, 'connect')
            .mockReturnValue(mockedTradeManager);

        mockedSigner = createMock<Signer>();
        tradeManagerDriver = new TradeManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly register a basic trade', async () => {
        const tradeId: number = await tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, name);

        expect(tradeId)
            .toEqual(0);

        expect(mockedContract.registerBasicTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.registerBasicTrade)
            .toHaveBeenNthCalledWith(1, supplier, customer, commissioner, externalUrl, name);
        expect(mockedWait)
            .toHaveBeenCalled();
    });

    it('should register a basic trade - FAIL(Error during basic trade registration, no events found)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined,
        });

        await expect(tradeManagerDriver.registerBasicTrade(supplier, customer, commissioner, externalUrl, name))
            .rejects
            .toThrow('Error during basic trade registration, no events found');
    });

    it('should correctly register a basic trade - FAIL(Not an address)', async () => {
        await expect(tradeManagerDriver.registerBasicTrade('not an address', customer, commissioner, externalUrl, name))
            .rejects
            .toThrow('Not an address');

        expect(mockedContract.registerBasicTrade)
            .toHaveBeenCalledTimes(0);
        expect(mockedWait)
            .not
            .toHaveBeenCalled();
    });

    it('should register an order trade - FAIL(Error during order trade registration, no events found)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined,
        });

        await expect(tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
            .rejects
            .toThrow('Error during order registration, no events found');
    });

    it('should correctly register an order trade', async () => {
        const tradeId: number = await tradeManagerDriver.registerOrderTrade(supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);

        expect(tradeId)
            .toEqual(1);

        expect(mockedContract.registerOrderTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.registerOrderTrade)
            .toHaveBeenNthCalledWith(1, supplier, customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress);
        expect(mockedWait)
            .toHaveBeenCalled();
    });

    it('should correctly register an order trade - FAIL(Not an address)', async () => {
        await expect(tradeManagerDriver.registerOrderTrade('not an address', customer, commissioner, externalUrl, paymentDeadline, documentDeliveryDeadline, arbiter, shippingDeadline, deliveryDeadline, agreedAmount, tokenAddress))
            .rejects
            .toThrow('Not an address');

        expect(mockedContract.registerOrderTrade)
            .toHaveBeenCalledTimes(0);
        expect(mockedWait)
            .not
            .toHaveBeenCalled();
    });

    it('should correctly get trades', async () => {
        const response = await tradeManagerDriver.getTrades();

        expect(response)
            .toEqual([mockedContractAddress]);

        expect(mockedContract.getTrades)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrades)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTrades)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly get trades and types', async () => {
        const response = await tradeManagerDriver.getTradesAndTypes();
        const expected = new Map<string, TradeType>();
        expected.set(mockedContractAddress, TradeType.BASIC);

        expect(response)
            .toEqual(expected);

        expect(mockedContract.getTradesAndTypes)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradesAndTypes)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTradesAndTypes)
            .toHaveBeenCalledTimes(1);
        expect(getTradeTypeByIndexSpy)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly get a trade', async () => {
        const response = await tradeManagerDriver.getTrade(0);

        expect(response)
            .toEqual(mockedContractAddress);

        expect(mockedContract.getTrade)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTrade)
            .toHaveBeenNthCalledWith(1, 0);
        expect(mockedGetTrade)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly get trade ids of supplier', async () => {
        const response = await tradeManagerDriver.getTradeIdsOfSupplier(supplier);

        expect(response)
            .toEqual([0]);

        expect(mockedContract.getTradeIdsOfCommissioner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradeIdsOfCommissioner)
            .toHaveBeenNthCalledWith(1, supplier);
        expect(mockedGetTradeIdsOfEntity)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly get trade ids of commissioner', async () => {
        const response = await tradeManagerDriver.getTradeIdsOfCommissioner(commissioner);

        expect(response)
            .toEqual([0]);

        expect(mockedContract.getTradeIdsOfCommissioner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTradeIdsOfCommissioner)
            .toHaveBeenNthCalledWith(1, commissioner);
        expect(mockedGetTradeIdsOfEntity)
            .toHaveBeenCalledTimes(1);
    });
});
