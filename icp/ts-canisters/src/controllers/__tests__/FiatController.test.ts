import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import FiatController from '../FiatController';
import FiatService from '../../services/FiatService';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/FiatService', () => ({
    instance: {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    }
}));
describe('FiatController', () => {
    const fiatServiceInstanceMock = FiatService.instance as jest.Mocked<FiatService>;
    const fiatController = new FiatController();

    it.each([
        {
            controllerFunctionName: 'getAllFiats',
            controllerFunction: () => fiatController.getAllFiats(),
            serviceFunction: fiatServiceInstanceMock.getAllValues,
            expectedResult: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addFiat',
            controllerFunction: () => fiatController.addFiat('value'),
            serviceFunction: fiatServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeFiat',
            controllerFunction: () => fiatController.removeFiat('value'),
            serviceFunction: fiatServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'hasFiat',
            controllerFunction: () => fiatController.hasFiat('value'),
            serviceFunction: fiatServiceInstanceMock.hasValue,
            expectedResult: true,
            expectedDecorators: [update, AtLeastViewer]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
