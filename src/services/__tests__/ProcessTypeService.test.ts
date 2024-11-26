import { createMock } from 'ts-auto-mock';
import { ProcessTypeService } from '../ProcessTypeService';
import { ProcessTypeDriver } from '../../../drivers/icp/ProcessTypeDriver';

jest.mock('@blockchain-lib/common');

describe('ProcessTypeService', () => {
    let processTypeService: ProcessTypeService;
    const mockedDriverFn = {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    };

    beforeAll(() => {
        const processTypeDriver = createMock<ProcessTypeDriver>({
            getAllValues: mockedDriverFn.getAllValues,
            addValue: mockedDriverFn.addValue,
            removeValue: mockedDriverFn.removeValue,
            hasValue: mockedDriverFn.hasValue
        });
        processTypeService = new ProcessTypeService(processTypeDriver);
    });

    it.each([
        {
            functionName: 'getAllValues',
            serviceFunction: () => processTypeService.getAllValues(),
            driverFunction: mockedDriverFn.getAllValues,
            driverFunctionResult: ['value1', 'value2'],
            driverFunctionArgs: []
        },
        {
            functionName: 'addValue',
            serviceFunction: () => processTypeService.addValue('value'),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
        },
        {
            functionName: 'removeValue',
            serviceFunction: () => processTypeService.removeValue('value'),
            driverFunction: mockedDriverFn.removeValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value']
        },
        {
            functionName: 'hasValue',
            serviceFunction: () => processTypeService.hasValue('value'),
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
