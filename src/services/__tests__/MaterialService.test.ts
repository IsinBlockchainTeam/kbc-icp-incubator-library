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
            serviceFunction: () => materialService.createMaterial('nameTest', 1, 'typologyTest', 'qualityTest', 'moistureTest', false),
            driverFunction: mockedFn.createMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: ['nameTest', 1, 'typologyTest', 'qualityTest', 'moistureTest', false]
        },
        {
            functionName: 'updateMaterial',
            serviceFunction: () => materialService.updateMaterial(1, 'nameTest', 1, 'typologyTest', 'qualityTest', 'moistureTest', false),
            driverFunction: mockedFn.updateMaterial,
            driverFunctionResult: {},
            driverFunctionArgs: [1, 'nameTest', 1, 'typologyTest', 'qualityTest', 'moistureTest', false]
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
