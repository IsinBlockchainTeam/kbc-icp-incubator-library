import { createMock } from 'ts-auto-mock';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { FiatService } from '../FiatService';
import { FiatDriver } from '../../drivers/FiatDriver';

describe('FiatService', () => {
    let fiatService: FiatService;
    const mockedDriverFn = {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    };

    beforeAll(() => {
        const fiatDriver = createMock<FiatDriver>({
            getAllValues: mockedDriverFn.getAllValues,
            addValue: mockedDriverFn.addValue,
            removeValue: mockedDriverFn.removeValue,
            hasValue: mockedDriverFn.hasValue
        });
        fiatService = new FiatService(fiatDriver);
    });

    it.each([
        {
            functionName: 'getAllValues',
            serviceFunction: () => fiatService.getAllValues(),
            driverFunction: mockedDriverFn.getAllValues,
            driverFunctionResult: ['value1', 'value2'],
            driverFunctionArgs: []
        },
        {
            functionName: 'addValue',
            serviceFunction: () => fiatService.addValue('value', IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value', IndustrialSectorEnum.COFFEE]
        },
        {
            functionName: 'removeValue',
            serviceFunction: () => fiatService.removeValue('value', IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.removeValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value', IndustrialSectorEnum.COFFEE]
        },
        {
            functionName: 'hasValue',
            serviceFunction: () => fiatService.hasValue('value'),
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
