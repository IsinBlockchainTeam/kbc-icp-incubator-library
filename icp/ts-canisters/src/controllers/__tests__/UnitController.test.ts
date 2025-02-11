import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import UnitService from '../../services/UnitService';
import UnitController from '../UnitController';
import { IndustrialSectorEnum } from '../../models/types';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/UnitService', () => ({
    instance: {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    }
}));
describe('UnitController', () => {
    const unitServiceInstanceMock = UnitService.instance as jest.Mocked<UnitService>;
    const unitController = new UnitController();

    it.each([
        {
            controllerFunctionName: 'getAllUnits',
            controllerFunction: () => unitController.getAllUnits(),
            serviceFunction: unitServiceInstanceMock.getAllValues,
            expectedResult: [],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addUnit',
            controllerFunction: () => unitController.addUnit('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: unitServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeUnit',
            controllerFunction: () => unitController.removeUnit('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: unitServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'hasUnit',
            controllerFunction: () => unitController.hasUnit('value'),
            serviceFunction: unitServiceInstanceMock.hasValue,
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
