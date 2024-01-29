import { createMock } from 'ts-auto-mock';
import { BasicTradeDriver } from '../drivers/BasicTradeDriver';
import { BasicTradeService } from './BasicTradeService';
import { Line, LineRequest } from '../entities/Trade';
import {Material} from "../entities/Material";
import {ProductCategory} from "../entities/ProductCategory";

describe('BasicTradeService', () => {
    const mockedBasicTradeDriver: BasicTradeDriver = createMock<BasicTradeDriver>({
        getTrade: jest.fn(),
        getLines: jest.fn(),
        getLine: jest.fn(),
        addLine: jest.fn(),
        updateLine: jest.fn(),
        assignMaterial: jest.fn(),
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
            expectedMockedFunctionArgs: [undefined],
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
            serviceFunction: () => basicTradeService.addLine(new LineRequest(1)),
            expectedMockedFunction: mockedBasicTradeDriver.addLine,
            expectedMockedFunctionArgs: [new LineRequest(1)],
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () => basicTradeService.updateLine(new Line(1, new Material(1, new ProductCategory(2, 'test', 10, 'description')), new ProductCategory(2, 'test', 10, 'description'))),
            expectedMockedFunction: mockedBasicTradeDriver.updateLine,
            expectedMockedFunctionArgs: [new Line(1, new Material(1, new ProductCategory(2, 'test', 10, 'description')), new ProductCategory(2, 'test', 10, 'description'))],
        },
        {
            serviceFunctionName: 'assignMaterial',
            serviceFunction: () => basicTradeService.assignMaterial(1, 1),
            expectedMockedFunction: mockedBasicTradeDriver.assignMaterial,
            expectedMockedFunctionArgs: [1, 1],
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
