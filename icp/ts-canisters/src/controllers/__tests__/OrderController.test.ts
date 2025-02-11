import { update } from 'azle';
import OrderController from '../OrderController';
import OrderService from '../../services/OrderService';
import { Order } from '../../models/types';
import { AtLeastEditor, AtLeastSigner, AtLeastViewer } from '../../decorators/roles';

jest.mock('azle');
jest.mock('../../decorators/parties');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/OrderService', () => ({
    instance: {
        getOrders: jest.fn(),
        getOrder: jest.fn(),
        createOrder: jest.fn(),
        updateOrder: jest.fn(),
        signOrder: jest.fn()
    }
}));
describe('OrderController', () => {
    const orderServiceInstanceMock = OrderService.instance as jest.Mocked<OrderService>;
    const orderController = new OrderController();

    it.each([
        {
            controllerFunctionName: 'getOrders',
            controllerFunction: () => orderController.getOrders(),
            serviceFunction: orderServiceInstanceMock.getOrders,
            expectedResult: [{ id: 1n } as Order],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getOrder',
            controllerFunction: () => orderController.getOrder(1n),
            serviceFunction: orderServiceInstanceMock.getOrder,
            expectedResult: { id: 1n } as Order,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'createOrder',
            controllerFunction: () =>
                orderController.createOrder('0xsupplier', '0xcustomer', '0xcommissioner', 1n, 2n, 3n, 4n, '0xarbiter', '0xtoken', 5n, 'incoterms', '0xshipper', 'shippingPort', 'deliveryPort', []),
            serviceFunction: orderServiceInstanceMock.createOrder,
            expectedResult: { id: 1n } as Order,
            expectedArguments: ['0xsupplier', '0xcustomer', '0xcommissioner', 1n, 2n, 3n, 4n, '0xarbiter', '0xtoken', 5n, 'incoterms', '0xshipper', 'shippingPort', 'deliveryPort', []],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'updateOrder',
            controllerFunction: () =>
                orderController.updateOrder(0n, '0xsupplier', '0xcustomer', '0xcommissioner', 1n, 2n, 3n, 4n, '0xarbiter', '0xtoken', 5n, 'incoterms', '0xshipper', 'shippingPort', 'deliveryPort', []),
            serviceFunction: orderServiceInstanceMock.updateOrder,
            expectedResult: { id: 1n } as Order,
            expectedArguments: [0n, '0xsupplier', '0xcustomer', '0xcommissioner', 1n, 2n, 3n, 4n, '0xarbiter', '0xtoken', 5n, 'incoterms', '0xshipper', 'shippingPort', 'deliveryPort', []],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'signOrder',
            controllerFunction: () => orderController.signOrder(1n),
            serviceFunction: orderServiceInstanceMock.signOrder,
            expectedResult: { id: 1n } as Order,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastSigner]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
