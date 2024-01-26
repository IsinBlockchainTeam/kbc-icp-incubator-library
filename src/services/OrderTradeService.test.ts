import { createMock } from 'ts-auto-mock';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { OrderTradeService } from './OrderTradeService';
import {
    OrderLine,
    OrderLinePrice,
    OrderLineRequest,
} from '../entities/OrderTrade';
import {Material} from "../entities/Material";
import {ProductCategory} from "../entities/ProductCategory";

describe('OrderTradeService', () => {
    const mockedOrderTradeDriver: OrderTradeDriver = createMock<OrderTradeDriver>({
        getTrade: jest.fn(),
        getLines: jest.fn(),
        getLine: jest.fn(),
        addLine: jest.fn(),
        updateLine: jest.fn(),
        getNegotiationStatus: jest.fn(),
        updatePaymentDeadline: jest.fn(),
        updateDocumentDeliveryDeadline: jest.fn(),
        updateArbiter: jest.fn(),
        updateShippingDeadline: jest.fn(),
        updateDeliveryDeadline: jest.fn(),
        confirmOrder: jest.fn(),
        getEmittedEvents: jest.fn(),
    });

    const orderTradeService = new OrderTradeService(
        mockedOrderTradeDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getTrade',
            serviceFunction: () => orderTradeService.getTrade(),
            expectedMockedFunction: mockedOrderTradeDriver.getTrade,
            expectedMockedFunctionArgs: [undefined],
        },
        {
            serviceFunctionName: 'getLines',
            serviceFunction: () => orderTradeService.getLines(),
            expectedMockedFunction: mockedOrderTradeDriver.getLines,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getLine',
            serviceFunction: () => orderTradeService.getLine(1),
            expectedMockedFunction: mockedOrderTradeDriver.getLine,
            expectedMockedFunctionArgs: [1, undefined],
        },
        {
            serviceFunctionName: 'addLine',
            serviceFunction: () => orderTradeService.addLine(new OrderLineRequest(1, 10, new OrderLinePrice(10.2, 'CHF'))),
            expectedMockedFunction: mockedOrderTradeDriver.addLine,
            expectedMockedFunctionArgs: [new OrderLineRequest(1, 10, new OrderLinePrice(10.2, 'CHF'))],
        },
        {
            serviceFunctionName: 'updateLine',
            serviceFunction: () => orderTradeService.updateLine(new OrderLine(1, new Material(1, new ProductCategory(2, 'test', 10, 'description')), new ProductCategory(2, 'test', 10, 'description'), 10, new OrderLinePrice(10.2, 'CHF'))),
            expectedMockedFunction: mockedOrderTradeDriver.updateLine,
            expectedMockedFunctionArgs: [new OrderLine(1, new Material(1, new ProductCategory(2, 'test', 10, 'description')), new ProductCategory(2, 'test', 10, 'description'), 10, new OrderLinePrice(10.2, 'CHF'))],
        },
        {
            serviceFunctionName: 'getNegotiationStatus',
            serviceFunction: () => orderTradeService.getNegotiationStatus(),
            expectedMockedFunction: mockedOrderTradeDriver.getNegotiationStatus,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'updatePaymentDeadline',
            serviceFunction: () => orderTradeService.updatePaymentDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updatePaymentDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'updateDocumentDeliveryDeadline',
            serviceFunction: () => orderTradeService.updateDocumentDeliveryDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateDocumentDeliveryDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'updateArbiter',
            serviceFunction: () => orderTradeService.updateArbiter('new arbiter'),
            expectedMockedFunction: mockedOrderTradeDriver.updateArbiter,
            expectedMockedFunctionArgs: ['new arbiter'],
        },
        {
            serviceFunctionName: 'updateShippingDeadline',
            serviceFunction: () => orderTradeService.updateShippingDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateShippingDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'updateDeliveryDeadline',
            serviceFunction: () => orderTradeService.updateDeliveryDeadline(1),
            expectedMockedFunction: mockedOrderTradeDriver.updateDeliveryDeadline,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'confirmOrder',
            serviceFunction: () => orderTradeService.confirmOrder(),
            expectedMockedFunction: mockedOrderTradeDriver.confirmOrder,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getEmittedEvents',
            serviceFunction: () => orderTradeService.getEmittedEvents(),
            expectedMockedFunction: mockedOrderTradeDriver.getEmittedEvents,
            expectedMockedFunctionArgs: [],
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
