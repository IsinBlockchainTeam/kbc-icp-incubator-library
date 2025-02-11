import { update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import AssessmentAssuranceLevelService from '../../services/AssessmentAssuranceLevelService';
import AssessmentAssuranceLevelController from '../AssessmentAssuranceLevelController';
import { IndustrialSectorEnum } from '../../models/types';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AssessmentAssuranceLevelService', () => ({
    instance: {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    }
}));
describe('AssessmentAssuranceLevelController', () => {
    const assessmentAssuranceLevelServiceInstanceMock = AssessmentAssuranceLevelService.instance as jest.Mocked<AssessmentAssuranceLevelService>;
    const assessmentAssuranceLevelController = new AssessmentAssuranceLevelController();

    it.each([
        {
            controllerFunctionName: 'getAllAssessmentAssuranceLevels',
            controllerFunction: () => assessmentAssuranceLevelController.getAllAssessmentAssuranceLevels(),
            serviceFunction: assessmentAssuranceLevelServiceInstanceMock.getAllValues,
            expectedResult: [],
            expectedArguments: [],
            expectedDecorators: [update, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addAssessmentAssuranceLevel',
            controllerFunction: () => assessmentAssuranceLevelController.addAssessmentAssuranceLevel('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: assessmentAssuranceLevelServiceInstanceMock.addValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'removeAssessmentAssuranceLevel',
            controllerFunction: () => assessmentAssuranceLevelController.removeAssessmentAssuranceLevel('value', IndustrialSectorEnum.COFFEE),
            serviceFunction: assessmentAssuranceLevelServiceInstanceMock.removeValue,
            expectedResult: 'value',
            expectedArguments: ['value', IndustrialSectorEnum.COFFEE],
            expectedDecorators: []
        },
        {
            controllerFunctionName: 'hasAssessmentAssuranceLevel',
            controllerFunction: () => assessmentAssuranceLevelController.hasAssessmentAssuranceLevel('value'),
            serviceFunction: assessmentAssuranceLevelServiceInstanceMock.hasValue,
            expectedResult: true,
            expectedArguments: ['value'],
            expectedDecorators: [update, AtLeastViewer]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
