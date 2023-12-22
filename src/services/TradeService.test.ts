import { createMock } from 'ts-auto-mock';
import { TradeDriver } from '../drivers/TradeDriver';
import { TradeService } from './TradeService';
import { DocumentType } from '../entities/DocumentInfo';

describe('TradeService', () => {
    const mockedTradeDriver: TradeDriver = createMock<TradeDriver>({
        getTrade: jest.fn(),
        getLines: jest.fn(),
        getLine: jest.fn(),
        getLineExists: jest.fn(),
        addLine: jest.fn(),
        updateLine: jest.fn(),
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
            serviceFunctionName: 'getTrade',
            serviceFunction: () => tradeService.getTrade(),
            expectedMockedFunction: mockedTradeDriver.getTrade,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLines',
            serviceFunction: () => tradeService.getLines(),
            expectedMockedFunction: mockedTradeDriver.getLines,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLine',
            serviceFunction: () => tradeService.getLine(1),
            expectedMockedFunction: mockedTradeDriver.getLine,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getLineExists',
            serviceFunction: () => tradeService.getLineExists(1),
            expectedMockedFunction: mockedTradeDriver.getLineExists,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'addLine',
            serviceFunction: () => tradeService.addLine([1, 2], 'category1'),
            expectedMockedFunction: mockedTradeDriver.addLine,
            expectedMockedFunctionArgs: [[1, 2], 'category1'],
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () => tradeService.updateLine(1, [1, 2], 'category1'),
            expectedMockedFunction: mockedTradeDriver.updateLine,
            expectedMockedFunctionArgs: [1, [1, 2], 'category1'],
        },
        {
            serviceFunctionName: 'getTradeStatus',
            serviceFunction: () => tradeService.getTradeStatus(),
            expectedMockedFunction: mockedTradeDriver.getTradeStatus,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'addDocument',
            serviceFunction: () => tradeService.addDocument('doc name', DocumentType.DELIVERY_NOTE, 'externalUrl'),
            expectedMockedFunction: mockedTradeDriver.addDocument,
            expectedMockedFunctionArgs: ['doc name', DocumentType.DELIVERY_NOTE, 'externalUrl'],
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
