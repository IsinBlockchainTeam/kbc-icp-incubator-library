import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { BasicTradeService } from './BasicTradeService';
import { Line, LineRequest } from '../entities/Trade';

describe('BasicTradeService', () => {
    const mockedBasicTradeDriver: BasicTradeDriver = createMock<BasicTradeDriver>({
        getTrade: jest.fn(),
        getLines: jest.fn(),
        getLine: jest.fn(),
        addLine: jest.fn(),
        updateLine: jest.fn(),
        setName: jest.fn(),
    });

    const basicTradeService = new BasicTradeService(
        mockedBasicTradeDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getTrade',
            serviceFunction: () => basicTradeService.getTrade(),
            expectedMockedFunction: mockedBasicTradeDriver.getTrade,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLines',
            serviceFunction: () => basicTradeService.getLines(),
            expectedMockedFunction: mockedBasicTradeDriver.getLines,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLine',
            serviceFunction: () => basicTradeService.getLine(1),
            expectedMockedFunction: mockedBasicTradeDriver.getLine,
            expectedMockedFunctionArgs: [1, undefined],
        },
        {
            serviceFunctionName: 'addLine',
            serviceFunction: () => basicTradeService.addLine(new LineRequest([1, 2], 'category')),
            expectedMockedFunction: mockedBasicTradeDriver.addLine,
            expectedMockedFunctionArgs: [new LineRequest([1, 2], 'category')],
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () => basicTradeService.updateLine(new Line(1, [1, 2], 'category')),
            expectedMockedFunction: mockedBasicTradeDriver.updateLine,
            expectedMockedFunctionArgs: [new Line(1, [1, 2], 'category')],
        },
        {
            serviceFunctionName: 'setName',
            serviceFunction: () => basicTradeService.setName('name'),
            expectedMockedFunction: mockedBasicTradeDriver.setName,
            expectedMockedFunctionArgs: ['name'],
        },
    ])('should call driver $serviceFunctionName', async ({
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
