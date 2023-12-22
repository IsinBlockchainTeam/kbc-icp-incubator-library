import { createMock } from 'ts-auto-mock';
import { OrderTradeDriver } from '../drivers/OrderTradeDriver';
import { OrderTradeService } from './OrderTradeService';
import { OrderLinePrice } from '../entities/OrderTrade';

describe('OrderTradeService', () => {
    const price: OrderLinePrice = new OrderLinePrice(10.2, 'Panda 1000 i.e. cat. 4X4');

    const mockedOrderTradeDriver: OrderTradeDriver = createMock<OrderTradeDriver>({
        getLines: jest.fn(),
        getOrderTrade: jest.fn(),
        addOrderLine: jest.fn(),
        updateOrderLine: jest.fn(),
        getNegotiationStatus: jest.fn(),
        updatePaymentDeadline: jest.fn(),
        updateDocumentDeliveryDeadline: jest.fn(),
        updateArbiter: jest.fn(),
        updateShippingDeadline: jest.fn(),
        updateDeliveryDeadline: jest.fn(),
        confirmOrder: jest.fn(),
    });

    const orderTradeService = new OrderTradeService(
        mockedOrderTradeDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
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
            serviceFunctionName: 'getOrderTrade',
            serviceFunction: () => orderTradeService.getOrderTrade(),
            expectedMockedFunction: mockedOrderTradeDriver.getOrderTrade,
            expectedMockedFunctionArgs: [undefined],
        },
        {
            serviceFunctionName: 'addOrderLine',
            serviceFunction: () => orderTradeService.addOrderLine([1, 2], 'category1', 1, price),
            expectedMockedFunction: mockedOrderTradeDriver.addOrderLine,
            expectedMockedFunctionArgs: [[1, 2], 'category1', 1, price],
        },
        {
            serviceFunctionName: 'updateOrderLine',
            serviceFunction: () => orderTradeService.updateOrderLine(1, [2, 3], 'catrogry2', 10, price),
            expectedMockedFunction: mockedOrderTradeDriver.updateOrderLine,
            expectedMockedFunctionArgs: [1, [2, 3], 'catrogry2', 10, price],
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
