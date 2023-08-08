import { createMock } from 'ts-auto-mock';
import OrderService from './OrderService';
import { OrderDriver } from '../drivers/OrderDriver';
import {OrderLine} from "../entities/OrderLine";

describe('OrderService', () => {
    let orderService: OrderService;

    let mockedOrderDriver: OrderDriver;

    const mockedRegisterOrder = jest.fn();
    const mockedGetOrderCounter = jest.fn();
    const mockedGetOrderInfo = jest.fn();
    const mockedIsSupplierOrCustomer = jest.fn();
    const mockedOrderExists = jest.fn();
    const mockedGetOrderStatus = jest.fn();
    const mockedConfirmOrder = jest.fn();
    const mockedGetOrderLine = jest.fn();
    const mockedAddOrderLine = jest.fn();
    const mockedUpdateOrderLine = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();

    const supplier = '0x70997970C51812dc3A010C7d01b50e0d17dc79C8';
    const customer = '0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199';
    const externalUrl = 'https://externalurl.com';

    let orderLine;
    const productCategory = 'categoryA';
    const quantity = 100;
    const price = { amount: 100, fiat: 'CHF' };

    beforeAll(() => {
        mockedOrderDriver = createMock<OrderDriver>({
            registerOrder: mockedRegisterOrder,
            getOrderCounter: mockedGetOrderCounter,
            getOrderInfo: mockedGetOrderInfo,
            isSupplierOrCustomer: mockedIsSupplierOrCustomer,
            orderExists: mockedOrderExists,
            getOrderStatus: mockedGetOrderStatus,
            confirmOrder: mockedConfirmOrder,
            getOrderLine: mockedGetOrderLine,
            addOrderLine: mockedAddOrderLine,
            updateOrderLine: mockedUpdateOrderLine,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
        });

        orderService = new OrderService(
            mockedOrderDriver,
        );

        orderLine = new OrderLine(0, productCategory, quantity, price);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerOrder',
            serviceFunction: () => orderService.registerOrder(supplier, customer, customer, externalUrl),
            expectedMockedFunction: mockedRegisterOrder,
            expectedMockedFunctionArgs: [supplier, customer, customer, externalUrl],
        },
        {
            serviceFunctionName: 'registerOrder',
            serviceFunction: () => orderService.registerOrder(supplier, customer, customer, externalUrl, [orderLine]),
            expectedMockedFunction: mockedRegisterOrder,
            expectedMockedFunctionArgs: [supplier, customer, customer, externalUrl, [orderLine]],
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
            serviceFunctionName: 'isSupplierOrCustomer',
            serviceFunction: () => orderService.isSupplierOrCustomer(supplier, 0, customer),
            expectedMockedFunction: mockedIsSupplierOrCustomer,
            expectedMockedFunctionArgs: [supplier, 0, customer],
        },
        {
            serviceFunctionName: 'orderExists',
            serviceFunction: () => orderService.orderExists(supplier, 0),
            expectedMockedFunction: mockedOrderExists,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'getOrderStatus',
            serviceFunction: () => orderService.getOrderStatus(supplier, 0),
            expectedMockedFunction: mockedGetOrderStatus,
            expectedMockedFunctionArgs: [supplier, 0],
        },
        {
            serviceFunctionName: 'confirmOrder',
            serviceFunction: () => orderService.confirmOrder(supplier, 0),
            expectedMockedFunction: mockedConfirmOrder,
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
            serviceFunction: () => orderService.addOrderLine(supplier, 0, productCategory, quantity, price),
            expectedMockedFunction: mockedAddOrderLine,
            expectedMockedFunctionArgs: [supplier, 0, productCategory, quantity, price],
        },
        {
            serviceFunctionName: 'updateOrderLine',
            serviceFunction: () => orderService.updateOrderLine(supplier, 0, 0, productCategory, quantity, price),
            expectedMockedFunction: mockedUpdateOrderLine,
            expectedMockedFunctionArgs: [supplier, 0, 0, productCategory, quantity, price],
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
