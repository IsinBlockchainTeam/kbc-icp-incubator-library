import { createMock } from 'ts-auto-mock';
import { TradeManagerService } from './TradeManagerService';
import { TradeManagerDriver } from '../drivers/TradeManagerDriver';
import { BasicTrade } from '../entities/BasicTrade';

import { OrderTrade } from '../entities/OrderTrade';

describe('TradeManagerService', () => {
    let tradeManagerService: TradeManagerService;

    let mockedTradeManagerDriver: TradeManagerDriver;
    const mockedInstance = {
        registerBasicTrade: jest.fn(),
        registerOrderTrade: jest.fn(),
        getTrades: jest.fn(),
        getTradesAndTypes: jest.fn(),
        getTrade: jest.fn(),
        getTradeIdsOfSupplier: jest.fn(),
        getTradeIdsOfCommissioner: jest.fn(),
    };

    const basicTrade: BasicTrade = new BasicTrade(1, 'supplier', 'customer', 'commissioner', 'externalUrl', [], 'name');
    const orderTrade: OrderTrade = new OrderTrade(1, 'supplier', 'customer', 'commissioner', 'externalUrl', [], true, false, 1000, 2000, 'arbiter', 3000, 4000, 'tokenAddress');
    const agreedAmount: number = 1000;
    const tokenAddress: string = 'tokenAddress';

    beforeAll(() => {
        mockedTradeManagerDriver = createMock<TradeManagerDriver>(mockedInstance);

        tradeManagerService = new TradeManagerService(mockedTradeManagerDriver);
    });

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerBasicTrade',
            serviceFunction: () => tradeManagerService.registerBasicTrade(basicTrade.supplier, basicTrade.customer, basicTrade.commissioner, basicTrade.externalUrl, basicTrade.name),
            expectedMockedFunction: mockedInstance.registerBasicTrade,
            expectedMockedFunctionArgs: [basicTrade.supplier, basicTrade.customer, basicTrade.commissioner, basicTrade.externalUrl, basicTrade.name],
        },
        {
            serviceFunctionName: 'registerOrderTrade',
            serviceFunction: () => tradeManagerService.registerOrderTrade(orderTrade.supplier, orderTrade.customer, orderTrade.commissioner, orderTrade.externalUrl, orderTrade.paymentDeadline, orderTrade.documentDeliveryDeadline, orderTrade.arbiter, orderTrade.shippingDeadline, orderTrade.deliveryDeadline, agreedAmount, tokenAddress),
            expectedMockedFunction: mockedInstance.registerOrderTrade,
            expectedMockedFunctionArgs: [orderTrade.supplier, orderTrade.customer, orderTrade.commissioner, orderTrade.externalUrl, orderTrade.paymentDeadline, orderTrade.documentDeliveryDeadline, orderTrade.arbiter, orderTrade.shippingDeadline, orderTrade.deliveryDeadline, agreedAmount, tokenAddress],
        },
        {
            serviceFunctionName: 'getTrades',
            serviceFunction: () => tradeManagerService.getTrades(),
            expectedMockedFunction: mockedInstance.getTrades,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTradesAndTypes',
            serviceFunction: () => tradeManagerService.getTradesAndTypes(),
            expectedMockedFunction: mockedInstance.getTradesAndTypes,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTrade',
            serviceFunction: () => tradeManagerService.getTrade(basicTrade.tradeId),
            expectedMockedFunction: mockedInstance.getTrade,
            expectedMockedFunctionArgs: [basicTrade.tradeId],
        },
        {
            serviceFunctionName: 'getTradeIdsOfSupplier',
            serviceFunction: () => tradeManagerService.getTradeIdsOfSupplier(basicTrade.supplier),
            expectedMockedFunction: mockedInstance.getTradeIdsOfSupplier,
            expectedMockedFunctionArgs: [basicTrade.supplier],
        },
        {
            serviceFunctionName: 'getTradeIdsOfCommissioner',
            serviceFunction: () => tradeManagerService.getTradeIdsOfCommissioner(basicTrade.commissioner),
            expectedMockedFunction: mockedInstance.getTradeIdsOfCommissioner,
            expectedMockedFunctionArgs: [basicTrade.commissioner],
        },
    ])('service should call driver $serviceFunctionName', async ({
        serviceFunction,
        expectedMockedFunction,
        expectedMockedFunctionArgs,
    }) => {
        await serviceFunction();

        expect(expectedMockedFunction)
            .toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction)
            .toHaveBeenCalledWith(...expectedMockedFunctionArgs);
    });
});
