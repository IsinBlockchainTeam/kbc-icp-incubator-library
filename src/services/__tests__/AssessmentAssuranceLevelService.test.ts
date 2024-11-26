import { createMock } from 'ts-auto-mock';
import { AssessmentAssuranceLevelService } from '../AssessmentAssuranceLevelService';
import { AssessmentAssuranceLevelDriver } from '../../../drivers/icp/AssessmentAssuranceLevelDriver';

jest.mock('@blockchain-lib/common');

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
            serviceFunction: () => assessmentAssuranceLevelService.addValue('value'),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
        },
        {
            functionName: 'removeValue',
            serviceFunction: () => assessmentAssuranceLevelService.removeValue('value'),
            driverFunction: mockedDriverFn.removeValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
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
