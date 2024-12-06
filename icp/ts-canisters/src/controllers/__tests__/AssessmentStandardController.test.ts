import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import AssessmentReferenceStandardController from '../AssessmentReferenceStandardController';
import AssessmentReferenceStandardService from '../../services/AssessmentReferenceStandardService';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AssessmentReferenceStandardService', () => ({
    instance: {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    }
}));
describe('AssessmentStandardController', () => {
    const assessmentStandardServiceInstanceMock = AssessmentReferenceStandardService.instance as jest.Mocked<AssessmentReferenceStandardService>;
    const assessmentStandardController = new AssessmentReferenceStandardController();

    it.each([
        {
            controllerFunctionName: 'getAllAssessmentStandards',
            controllerFunction: () => assessmentStandardController.getAllAssessmentReferenceStandards(),
            serviceFunction: assessmentStandardServiceInstanceMock.getAllValues,
            expectedResult: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addAssessmentStandard',
            controllerFunction: () => assessmentStandardController.addAssessmentReferenceStandard('value'),
            serviceFunction: assessmentStandardServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeAssessmentStandard',
            controllerFunction: () => assessmentStandardController.removeAssessmentReferenceStandard('value'),
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
