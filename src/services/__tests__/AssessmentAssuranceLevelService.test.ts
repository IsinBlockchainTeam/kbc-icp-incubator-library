import { createMock } from 'ts-auto-mock';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { AssessmentAssuranceLevelService } from '../AssessmentAssuranceLevelService';
import { AssessmentAssuranceLevelDriver } from '../../drivers/AssessmentAssuranceLevelDriver';

describe('AssessmentAssuranceLevelService', () => {
    let assessmentAssuranceLevelService: AssessmentAssuranceLevelService;
    const mockedDriverFn = {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    };

    beforeAll(() => {
        const assessmentAssuranceLevelDriver = createMock<AssessmentAssuranceLevelDriver>({
            getAllValues: mockedDriverFn.getAllValues,
            addValue: mockedDriverFn.addValue,
            removeValue: mockedDriverFn.removeValue,
            hasValue: mockedDriverFn.hasValue
        });
        assessmentAssuranceLevelService = new AssessmentAssuranceLevelService(
            assessmentAssuranceLevelDriver
        );
    });

    it.each([
        {
            functionName: 'getAllValues',
            serviceFunction: () => assessmentAssuranceLevelService.getAllValues(),
            driverFunction: mockedDriverFn.getAllValues,
            driverFunctionResult: ['value1', 'value2'],
            driverFunctionArgs: []
        },
        {
            functionName: 'addValue',
            serviceFunction: () =>
                assessmentAssuranceLevelService.addValue('value', IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value', IndustrialSectorEnum.COFFEE]
        },
        {
            functionName: 'removeValue',
            serviceFunction: () =>
                assessmentAssuranceLevelService.removeValue('value', IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.removeValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value', IndustrialSectorEnum.COFFEE]
        },
        {
            functionName: 'hasValue',
            serviceFunction: () => assessmentAssuranceLevelService.hasValue('value'),
            driverFunction: mockedDriverFn.hasValue,
            driverFunctionResult: true,
            driverFunctionArgs: ['value']
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
