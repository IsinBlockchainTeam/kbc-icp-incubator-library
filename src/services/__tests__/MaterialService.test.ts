import { createMock } from 'ts-auto-mock';
import { MaterialService } from '../MaterialService';
import { MaterialDriver } from '../../drivers/MaterialDriver';

describe('MaterialService', () => {
    let materialService: MaterialService;
    const mockedFn = {
        getMaterials: jest.fn(),
        getMaterial: jest.fn(),
        createMaterial: jest.fn(),
        updateMaterial: jest.fn()
    };

    beforeAll(() => {
        const materialDriver = createMock<MaterialDriver>({
            getMaterials: mockedFn.getMaterials,
            getMaterial: mockedFn.getMaterial,
            createMaterial: mockedFn.createMaterial,
            updateMaterial: mockedFn.updateMaterial
        });
        materialService = new MaterialService(materialDriver);
    });

    it.each([
        {
            functionName: 'getMaterials',
            serviceFunction: () => materialService.getMaterials(),
            driverFunction: mockedFn.getMaterials,
            driverFunctionResult: [],
            driverFunctionArgs: []
        },
        {
            functionName: 'getMaterial',
            serviceFunction: () => materialService.getMaterial(1),
            driverFunction: mockedFn.getMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [1]
        },
        {
            functionName: 'createMaterial',
            serviceFunction: () => materialService.createMaterial(1, 'typologyTest', 'qualityTest', 'moistureTest'),
            driverFunction: mockedFn.createMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [1, 'typologyTest', 'qualityTest', 'moistureTest']
        },
        {
            functionName: 'updateMaterial',
            serviceFunction: () => materialService.updateMaterial(1, 1, 'typologyTest', 'qualityTest', 'moistureTest'),
            driverFunction: mockedFn.updateMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [1, 1, 'typologyTest', 'qualityTest', 'moistureTest']
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
