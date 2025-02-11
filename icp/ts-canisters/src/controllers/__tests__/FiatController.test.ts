import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import FiatController from '../FiatController';
import FiatService from '../../services/FiatService';
import { IndustrialSectorEnum } from '../../models/types';

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
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addFiat',
            controllerFunction: () => fiatController.addFiat('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: fiatServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeFiat',
            controllerFunction: () => fiatController.removeFiat('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: fiatServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'hasFiat',
            controllerFunction: () => fiatController.hasFiat('value'),
            serviceFunction: fiatServiceInstanceMock.hasValue,
            expectedResult: true,
            expectedArguments: ['value'],
            expectedDecorators: [update, AtLeastViewer]
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
