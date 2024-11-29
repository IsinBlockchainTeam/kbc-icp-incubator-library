import { update } from 'azle';
import { AtLeastSigner, AtLeastViewer } from '../../decorators/roles';
import ProcessTypeController from '../ProcessTypeController';
import ProcessTypeService from '../../services/ProcessTypeService';

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
            expectedResult: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addProcessType',
            controllerFunction: () => processTypeController.addProcessType('value'),
            serviceFunction: processTypeServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedDecorators: [update, AtLeastSigner]
        },
        {
            controllerFunctionName: 'removeProcessType',
            controllerFunction: () => processTypeController.removeProcessType('value'),
            serviceFunction: processTypeServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedDecorators: [update, AtLeastSigner]
        },
        {
            controllerFunctionName: 'hasProcessType',
            controllerFunction: () => processTypeController.hasProcessType('value'),
            serviceFunction: processTypeServiceInstanceMock.hasValue,
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
