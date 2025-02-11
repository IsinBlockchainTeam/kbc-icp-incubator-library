import { createMock } from 'ts-auto-mock';
import { IndustrialSectorEnum } from '@kbc-lib/azle-types';
import { UnitService } from '../UnitService';
import { UnitDriver } from '../../drivers/UnitDriver';

describe('UnitService', () => {
    let unitService: UnitService;
    const mockedDriverFn = {
        getAllValues: jest.fn(),
        addValue: jest.fn(),
        removeValue: jest.fn(),
        hasValue: jest.fn()
    };

    beforeAll(() => {
        const unitDriver = createMock<UnitDriver>({
            getAllValues: mockedDriverFn.getAllValues,
            addValue: mockedDriverFn.addValue,
            removeValue: mockedDriverFn.removeValue,
            hasValue: mockedDriverFn.hasValue
        });
        unitService = new UnitService(unitDriver);
    });

    it.each([
        {
            functionName: 'getAllValues',
            serviceFunction: () => unitService.getAllValues(),
            driverFunction: mockedDriverFn.getAllValues,
            driverFunctionResult: ['value1', 'value2'],
            driverFunctionArgs: []
        },
        {
            functionName: 'addValue',
            serviceFunction: () => unitService.addValue('value', IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.addValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value', IndustrialSectorEnum.COFFEE]
        },
        {
            functionName: 'removeValue',
            serviceFunction: () => unitService.removeValue('value', IndustrialSectorEnum.COFFEE),
            driverFunction: mockedDriverFn.removeValue,
            driverFunctionResult: 'value',
            driverFunctionArgs: ['value', IndustrialSectorEnum.COFFEE]
        },
        {
            functionName: 'hasValue',
            serviceFunction: () => unitService.hasValue('value'),
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
