import { createMock } from 'ts-auto-mock';
import { AssessmentStandardService } from '../AssessmentStandardService';
import { AssessmentStandardDriver } from '../../drivers/AssessmentStandardDriver';

jest.mock('@blockchain-lib/common');

describe('AssessmentStandardService', () => {
    let assessmentStandardService: AssessmentStandardService;
    const mockedDriverFn = {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    };

    beforeAll(() => {
        const assessmentStandardDriver = createMock<AssessmentStandardDriver>({
            getAllValues: mockedDriverFn.getAllValues,
            addValue: mockedDriverFn.addValue,
            removeValue: mockedDriverFn.removeValue,
            hasValue: mockedDriverFn.hasValue
        });
        assessmentStandardService = new AssessmentStandardService(assessmentStandardDriver);
    });

    it.each([
        {
            functionName: 'getAllValues',
            serviceFunction: () => assessmentStandardService.getAllValues(),
            driverFunction: mockedDriverFn.getAllValues,
            driverFunctionResult: ['value1', 'value2'],
            driverFunctionArgs: []
        },
        {
            functionName: 'addValue',
            serviceFunction: () => assessmentStandardService.addValue('value'),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
        },
        {
            functionName: 'removeValue',
            serviceFunction: () => assessmentStandardService.removeValue('value'),
            driverFunction: mockedDriverFn.removeValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
        },
        {
            functionName: 'hasValue',
            serviceFunction: () => assessmentStandardService.hasValue('value'),
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
