import { createMock } from 'ts-auto-mock';
import { OrderService } from '../OrderService';
import {OrderDriver, OrderParams} from '../../drivers/OrderDriver';

describe('OrderService', () => {
    let orderService: OrderService;
    const orderParams = {} as OrderParams;
    const mockedFn = {
        getOrders: jest.fn(),
        getOrder: jest.fn(),
        createOrder: jest.fn(),
        updateOrder: jest.fn(),
        signOrder: jest.fn()
    };

    beforeAll(() => {
        const orderDriver = createMock<OrderDriver>({
            getOrders: mockedFn.getOrders,
            getOrder: mockedFn.getOrder,
            createOrder: mockedFn.createOrder,
            updateOrder: mockedFn.updateOrder,
            signOrder: mockedFn.signOrder
        });
        orderService = new OrderService(orderDriver);
    });

    it.each([
        {
            functionName: 'getOrders',
            serviceFunction: () => orderService.getOrders(),
            driverFunction: mockedFn.getOrders,
            driverFunctionResult: [],
            driverFunctionArgs: []
        },
        {
            functionName: 'getOrder',
            serviceFunction: () => orderService.getOrder(1),
            driverFunction: mockedFn.getOrder,
            driverFunctionResult: {},
            driverFunctionArgs: [1]
        },
        {
            functionName: 'createOrder',
            serviceFunction: () => orderService.createOrder(orderParams),
            driverFunction: mockedFn.createOrder,
            driverFunctionResult: {},
            driverFunctionArgs: [orderParams]
        },
        {
            functionName: 'updateOrder',
            serviceFunction: () => orderService.updateOrder(1, orderParams),
            driverFunction: mockedFn.updateOrder,
            driverFunctionResult: {},
            driverFunctionArgs: [1, orderParams]
        },
        {
            functionName: 'signOrder',
            serviceFunction: () => orderService.signOrder(1),
            driverFunction: mockedFn.signOrder,
            driverFunctionResult: {},
            driverFunctionArgs: [1]
        }
    ])(
        `should call driver function $functionName`,
        async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
            driverFunction.mockReturnValue(driverFunctionResult);
            await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
            expect(driverFunction).toHaveBeenCalled();
            expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
        }
    );
});
