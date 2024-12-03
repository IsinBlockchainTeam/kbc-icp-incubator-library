import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import AssessmentStandardController from '../AssessmentStandardController';
import AssessmentStandardService from '../../services/AssessmentStandardService';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AssessmentStandardService', () => ({
    instance: {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    }
}));
describe('AssessmentStandardController', () => {
    const assessmentStandardServiceInstanceMock = AssessmentStandardService.instance as jest.Mocked<AssessmentStandardService>;
    const assessmentStandardController = new AssessmentStandardController();

    it.each([
        {
            controllerFunctionName: 'getAllAssessmentStandards',
            controllerFunction: () => assessmentStandardController.getAllAssessmentStandards(),
            serviceFunction: assessmentStandardServiceInstanceMock.getAllValues,
            expectedResult: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addAssessmentStandard',
            controllerFunction: () => assessmentStandardController.addAssessmentStandard('value'),
            serviceFunction: assessmentStandardServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeAssessmentStandard',
            controllerFunction: () => assessmentStandardController.removeAssessmentStandard('value'),
            serviceFunction: assessmentStandardServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'hasAssessmentStandard',
            controllerFunction: () => assessmentStandardController.hasAssessmentStandard('value'),
            serviceFunction: assessmentStandardServiceInstanceMock.hasValue,
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
