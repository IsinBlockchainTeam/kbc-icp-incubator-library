import { createMock } from 'ts-auto-mock';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { AssessmentReferenceStandardService } from '../AssessmentReferenceStandardService';
import { AssessmentReferenceStandardDriver } from '../../drivers/AssessmentReferenceStandardDriver';
import { AssessmentReferenceStandard } from '../../entities/AssessmentReferenceStandard';

describe('AssessmentStandardService', () => {
    let assessmentStandardService: AssessmentReferenceStandardService;
    const mockedDriverFn = {
        getAll: jest.fn(),
        getById: jest.fn(),
        add: jest.fn(),
        removeById: jest.fn()
    };

    beforeAll(() => {
        const assessmentStandardDriver = createMock<AssessmentReferenceStandardDriver>({
            getAll: mockedDriverFn.getAll,
            getById: mockedDriverFn.getById,
            add: mockedDriverFn.add,
            removeById: mockedDriverFn.removeById
        });
        assessmentStandardService = new AssessmentReferenceStandardService(
            assessmentStandardDriver
        );
    });

    it.each([
        {
            functionName: 'getAll',
            serviceFunction: () => assessmentStandardService.getAll(),
            driverFunction: mockedDriverFn.getAll,
            driverFunctionResult: [{ id: 1 } as AssessmentReferenceStandard],
            driverFunctionArgs: []
        },
        {
            functionName: 'getById',
            serviceFunction: () => assessmentStandardService.getById(3),
            driverFunction: mockedDriverFn.getById,
            driverFunctionResult: { id: 3 } as AssessmentReferenceStandard,
            driverFunctionArgs: [3]
        },
        {
            functionName: 'add',
            serviceFunction: () =>
                assessmentStandardService.add(
                    'standard1',
                    'criteria',
                    'logo',
                    'site',
                    IndustrialSectorEnum.COFFEE
                ),
            driverFunction: mockedDriverFn.add,
            driverFunctionResult: { id: 2 } as AssessmentReferenceStandard,
            driverFunctionArgs: [
                'standard1',
                'criteria',
                'logo',
                'site',
                IndustrialSectorEnum.COFFEE
            ]
        },
        {
            functionName: 'removeById',
            serviceFunction: () =>
                assessmentStandardService.removeById(3, IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.removeById,
            driverFunctionResult: { id: 3 } as AssessmentReferenceStandard,
            driverFunctionArgs: [3, IndustrialSectorEnum.COFFEE]
        }
    ])(
        `should call driver function $functionName`,
        async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
            driverFunction.mockReturnValue(driverFunctionResult);
            await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
            expect(driverFunction).toHaveBeenCalled();
            expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
        }
    );
});
