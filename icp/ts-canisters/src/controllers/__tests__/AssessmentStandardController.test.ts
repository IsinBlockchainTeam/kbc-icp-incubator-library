import { query, update } from 'azle';
import { AtLeastViewer } from '../../decorators/roles';
import AssessmentReferenceStandardController from '../AssessmentReferenceStandardController';
import AssessmentReferenceStandardService from '../../services/AssessmentReferenceStandardService';
import { AssessmentReferenceStandard, IndustrialSectorEnum } from '../../models/types';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AssessmentReferenceStandardService', () => ({
    instance: {
        getAll: jest.fn(),
        getById: jest.fn(),
        add: jest.fn(),
        remove: jest.fn()
    }
}));
describe('AssessmentStandardController', () => {
    const assessmentStandardServiceInstanceMock = AssessmentReferenceStandardService.instance as jest.Mocked<AssessmentReferenceStandardService>;
    const assessmentStandardController = new AssessmentReferenceStandardController();

    it.each([
        {
            controllerFunctionName: 'getAllAssessmentReferenceStandards',
            controllerFunction: () => assessmentStandardController.getAllAssessmentReferenceStandards(),
            serviceFunction: assessmentStandardServiceInstanceMock.getAll,
            expectedResult: [],
            expectedArguments: [],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getAssessmentReferenceStandard',
            controllerFunction: () => assessmentStandardController.getAssessmentReferenceStandard(2n),
            serviceFunction: assessmentStandardServiceInstanceMock.getById,
            expectedResult: { id: 2n } as AssessmentReferenceStandard,
            expectedArguments: [2n],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'addAssessmentReferenceStandard',
            controllerFunction: () => assessmentStandardController.addAssessmentReferenceStandard('standard 1', 'criteria', 'logo', 'site', IndustrialSectorEnum.COFFEE),
            serviceFunction: assessmentStandardServiceInstanceMock.add,
            expectedResult: { id: 1n } as AssessmentReferenceStandard,
            expectedArguments: ['standard 1', 'criteria', 'logo', 'site', IndustrialSectorEnum.COFFEE],
            expectedDecorators: [update]
        },
        {
            controllerFunctionName: 'removeAssessmentReferenceStandard',
            controllerFunction: () => assessmentStandardController.removeAssessmentReferenceStandard(2n, IndustrialSectorEnum.COFFEE),
            serviceFunction: assessmentStandardServiceInstanceMock.remove,
            expectedResult: { id: 2n } as AssessmentReferenceStandard,
            expectedArguments: [2n, IndustrialSectorEnum.COFFEE],
            expectedDecorators: [update]
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
