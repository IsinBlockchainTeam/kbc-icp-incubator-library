import { createMock } from 'ts-auto-mock';
import OrderService from './OrderService';
import { OrderDriver } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';
import { OrderLine } from '../entities/OrderLine';

describe('OrderService', () => {
    let orderService: OrderService;

    let mockedOrderDriver: OrderDriver;

    const mockedRegisterOrder = jest.fn();
    const mockedGetOrderCounter = jest.fn();
    const mockedGetOrderInfo = jest.fn();
    const mockedOrderExists = jest.fn();
    const mockedGetOrderLine = jest.fn();
    const mockedAddOrderLine = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();

    const supplier = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';

    const orderLine: OrderLine = new OrderLine(1, 50);
    const order: Order = new Order(supplier, 1, 'externalUrl', [1], [orderLine]);

    beforeAll(() => {
        mockedOrderDriver = createMock<OrderDriver>({
            registerOrder: mockedRegisterOrder,
            getOrderCounter: mockedGetOrderCounter,
            getOrderInfo: mockedGetOrderInfo,
            orderExists: mockedOrderExists,
            getOrderLine: mockedGetOrderLine,
            addOrderLine: mockedAddOrderLine,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
        });

        orderService = new OrderService(
            mockedOrderDriver,
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerOrder',
            serviceFunction: () => orderService.registerOrder(order),
            expectedMockedFunction: mockedRegisterOrder,
            expectedMockedFunctionArgs: [order],
        },
        {
            serviceFunctionName: 'getOrderCounter',
            serviceFunction: () => orderService.getOrderCounter(supplier),
            expectedMockedFunction: mockedGetOrderCounter,
            expectedMockedFunctionArgs: [supplier],
        },
        {
            serviceFunctionName: 'getOrderInfo',
            serviceFunction: () => orderService.getOrderInfo(supplier, 0),
            expectedMockedFunction: mockedGetOrderInfo,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'orderExists',
            serviceFunction: () => orderService.orderExists(supplier, 0),
            expectedMockedFunction: mockedOrderExists,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'getOrderLine',
            serviceFunction: () => orderService.getOrderLine(supplier, 0, 0),
            expectedMockedFunction: mockedGetOrderLine,
            expectedMockedFunctionArgs: [supplier, 0, 0],
        },
        {
            serviceFunctionName: 'addOrderLine',
            serviceFunction: () => orderService.addOrderLine(supplier, 0, orderLine),
            expectedMockedFunction: mockedAddOrderLine,
            expectedMockedFunctionArgs: [supplier, 0, orderLine],
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => orderService.addAdmin('testAddress'),
            expectedMockedFunction: mockedAddAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => orderService.removeAdmin('testAddress'),
            expectedMockedFunction: mockedRemoveAdmin,
            expectedMockedFunctionArgs: ['testAddress'],
        },
    ])('should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
