import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { BasicTradeService } from './BasicTradeService';

describe('BasicTradeService', () => {
    const mockedBasicTradeDriver: BasicTradeDriver = createMock<BasicTradeDriver>({
        getBasicTrade: jest.fn(),
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
            serviceFunctionName: 'getBasicTrade',
            serviceFunction: () => basicTradeService.getBasicTrade(),
            expectedMockedFunction: mockedBasicTradeDriver.getBasicTrade,
            expectedMockedFunctionArgs: [],
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
