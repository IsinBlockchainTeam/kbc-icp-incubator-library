import OrderController from "../OrderController";
import OrderService from "../../services/OrderService";
import {Order} from "../../models/types";
import {update} from "azle";
import {AtLeastEditor, AtLeastSigner, AtLeastViewer} from "../../decorators/roles";
jest.mock('azle');
jest.mock('../../decorators/parties');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/OrderService', () => {
    return {
        instance: {
            getOrders: jest.fn(),
            getOrder: jest.fn(),
            createOrder: jest.fn(),
            updateOrder: jest.fn(),
            signOrder: jest.fn()
        }
    };
});
describe('OrderController', () => {
    let orderServiceInstanceMock = OrderService.instance as jest.Mocked<OrderService>;
    let orderController = new OrderController();

    it.each([
        {
            controllerFunctionName: 'getOrders',
            controllerFunction: () => orderController.getOrders(),
            serviceFunction: orderServiceInstanceMock.getOrders,
            expectedResult: [{id: 1n} as Order],
            expectedDecorators: [update, AtLeastViewer],
        }, {
            controllerFunctionName: 'getOrder',
            controllerFunction: () => orderController.getOrder(1n),
            serviceFunction: orderServiceInstanceMock.getOrder,
            expectedResult: {id: 1n} as Order,
            expectedDecorators: [update, AtLeastViewer],
        }, {
            controllerFunctionName: 'createOrder',
            controllerFunction: () => orderController.createOrder(
                '0xsupplier',
                '0xcustomer',
                '0xcommissioner',
                1n,
                2n,
                3n,
                4n,
                '0xarbiter',
                '0xtoken',
                5n,
                '0xescrowManager',
                'incoterms',
                '0xshipper',
                'shippingPort',
                'deliveryPort',
                []
            ),
            serviceFunction: orderServiceInstanceMock.createOrder,
            expectedResult: {id: 1n} as Order,
            expectedDecorators: [update, AtLeastEditor],
        }, {
            controllerFunctionName: 'updateOrder',
            controllerFunction: () => orderController.updateOrder(
                0n,
                '0xsupplier',
                '0xcustomer',
                '0xcommissioner',
                1n,
                2n,
                3n,
                4n,
                '0xarbiter',
                '0xtoken',
                5n,
                '0xescrowManager',
                'incoterms',
                '0xshipper',
                'shippingPort',
                'deliveryPort',
                []
            ),
            serviceFunction: orderServiceInstanceMock.updateOrder,
            expectedResult: {id: 1n} as Order,
            expectedDecorators: [update, AtLeastEditor],
        }, {
            controllerFunctionName: 'signOrder',
            controllerFunction: () => orderController.signOrder(1n),
            serviceFunction: orderServiceInstanceMock.signOrder,
            expectedResult: {id: 1n} as Order,
            expectedDecorators: [update, AtLeastSigner],
        },
    ])
    ('should cass service $serviceFunctionName', async (
        {controllerFunction, serviceFunction, expectedResult, expectedDecorators}
    ) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
