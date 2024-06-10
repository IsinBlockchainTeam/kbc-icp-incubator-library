import { createMock } from 'ts-auto-mock';
import { MaterialService } from './MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';

describe('MaterialService', () => {
    const mockedMaterialDriver: MaterialDriver = createMock<MaterialDriver>({
        getMaterialsCounter: jest.fn(),
        getMaterialExists: jest.fn(),
        getMaterial: jest.fn(),
        getMaterials: jest.fn(),
        getMaterialsOfCreator: jest.fn(),
        registerMaterial: jest.fn(),
        updateMaterial: jest.fn()
    });

    const materialService = new MaterialService(mockedMaterialDriver);

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getMaterialsCounter',
            serviceFunction: () => materialService.getMaterialsCounter(),
            expectedMockedFunction: mockedMaterialDriver.getMaterialsCounter,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getMaterialExists',
            serviceFunction: () => materialService.getMaterialExists(1),
            expectedMockedFunction: mockedMaterialDriver.getMaterialExists,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'getMaterial',
            serviceFunction: () => materialService.getMaterial(1),
            expectedMockedFunction: mockedMaterialDriver.getMaterial,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'getMaterials',
            serviceFunction: () => materialService.getMaterials(),
            expectedMockedFunction: mockedMaterialDriver.getMaterials,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getMaterialsOfCreator',
            serviceFunction: () => materialService.getMaterialsOfCreator('creator'),
            expectedMockedFunction: mockedMaterialDriver.getMaterialsOfCreator,
            expectedMockedFunctionArgs: ['creator']
        },
        {
            serviceFunctionName: 'registerMaterial',
            serviceFunction: () => materialService.registerMaterial(1),
            expectedMockedFunction: mockedMaterialDriver.registerMaterial,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => materialService.updateMaterial(1, 2),
            expectedMockedFunction: mockedMaterialDriver.updateMaterial,
            expectedMockedFunctionArgs: [1, 2]
        }
    ])(
        'service should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );
});
