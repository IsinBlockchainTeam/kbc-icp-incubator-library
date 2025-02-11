import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import ProcessTypeController from '../ProcessTypeController';
import ProcessTypeService from '../../services/ProcessTypeService';
import { IndustrialSectorEnum } from '../../models/types';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/ProcessTypeService', () => ({
    instance: {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    }
}));
describe('ProcessTypeController', () => {
    const processTypeServiceInstanceMock = ProcessTypeService.instance as jest.Mocked<ProcessTypeService>;
    const processTypeController = new ProcessTypeController();

    it.each([
        {
            controllerFunctionName: 'getAllProcessTypes',
            controllerFunction: () => processTypeController.getAllProcessTypes(),
            serviceFunction: processTypeServiceInstanceMock.getAllValues,
            expectedResult: [] as string[],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addProcessType',
            controllerFunction: () => processTypeController.addProcessType('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: processTypeServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeProcessType',
            controllerFunction: () => processTypeController.removeProcessType('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: processTypeServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'hasProcessType',
            controllerFunction: () => processTypeController.hasProcessType('value'),
            serviceFunction: processTypeServiceInstanceMock.hasValue,
            expectedResult: true,
            expectedArguments: ['value'],
            expectedDecorators: [update, AtLeastViewer]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        // @ts-ignore
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
