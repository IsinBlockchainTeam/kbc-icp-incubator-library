import { createMock } from 'ts-auto-mock';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeService } from './TradeService';
import { DocumentType } from '../entities/DocumentInfo';

describe('TradeService', () => {
    const mockedTradeDriver: TradeDriver = createMock<TradeDriver>({
        getLineCounter: jest.fn(),
        getTradeType: jest.fn(),
        getLineExists: jest.fn(),
        getTradeStatus: jest.fn(),
        addDocument: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    });

    const tradeService = new TradeService(
        mockedTradeDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getLineCounter',
            serviceFunction: () => tradeService.getLineCounter(),
            expectedMockedFunction: mockedTradeDriver.getLineCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTradeType',
            serviceFunction: () => tradeService.getTradeType(),
            expectedMockedFunction: mockedTradeDriver.getTradeType,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLineExists',
            serviceFunction: () => tradeService.getLineExists(1),
            expectedMockedFunction: mockedTradeDriver.getLineExists,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getTradeStatus',
            serviceFunction: () => tradeService.getTradeStatus(),
            expectedMockedFunction: mockedTradeDriver.getTradeStatus,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'addDocument',
            serviceFunction: () => tradeService.addDocument(1, 'doc name', DocumentType.DELIVERY_NOTE, 'externalUrl'),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: [1, 'doc name', DocumentType.DELIVERY_NOTE, 'externalUrl'],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => tradeService.addAdmin('testAddress'),
            expectedMockedFunction: mockedTradeDriver.addAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => tradeService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedTradeDriver.removeAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
