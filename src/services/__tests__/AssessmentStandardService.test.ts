import { createMock } from 'ts-auto-mock';
import { AssessmentReferenceStandardService } from '../AssessmentReferenceStandardService';
import { AssessmentReferenceStandardDriver } from '../../drivers/AssessmentReferenceStandardDriver';

describe('AssessmentStandardService', () => {
    let assessmentStandardService: AssessmentReferenceStandardService;
    const mockedDriverFn = {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    };

    beforeAll(() => {
        const assessmentStandardDriver = createMock<AssessmentReferenceStandardDriver>({
            getAll: mockedDriverFn.getAllValues,
            add: mockedDriverFn.addValue,
            removeById: mockedDriverFn.removeValue,
            hasValue: mockedDriverFn.hasValue
        });
        assessmentStandardService = new AssessmentReferenceStandardService(assessmentStandardDriver);
    });

    it.each([
        {
            functionName: 'getAllValues',
            serviceFunction: () => assessmentStandardService.getAll(),
            driverFunction: mockedDriverFn.getAllValues,
            driverFunctionResult: ['value1', 'value2'],
            driverFunctionArgs: []
        },
        {
            functionName: 'addValue',
            serviceFunction: () => assessmentStandardService.add('value'),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
        },
        {
            functionName: 'removeValue',
            serviceFunction: () => assessmentStandardService.removeById('value'),
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
