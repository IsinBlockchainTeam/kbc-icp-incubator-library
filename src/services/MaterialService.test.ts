import { createMock } from 'ts-auto-mock';
import { MaterialService } from './MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { RoleProof } from '../types/RoleProof';

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

    const roleProof: RoleProof = createMock<RoleProof>();

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getMaterialsCounter',
            serviceFunction: () => materialService.getMaterialsCounter(roleProof),
            expectedMockedFunction: mockedMaterialDriver.getMaterialsCounter,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getMaterialExists',
            serviceFunction: () => materialService.getMaterialExists(roleProof, 1),
            expectedMockedFunction: mockedMaterialDriver.getMaterialExists,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getMaterial',
            serviceFunction: () => materialService.getMaterial(roleProof, 1),
            expectedMockedFunction: mockedMaterialDriver.getMaterial,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getMaterials',
            serviceFunction: () => materialService.getMaterials(roleProof),
            expectedMockedFunction: mockedMaterialDriver.getMaterials,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getMaterialsOfCreator',
            serviceFunction: () => materialService.getMaterialsOfCreator(roleProof, 'creator'),
            expectedMockedFunction: mockedMaterialDriver.getMaterialsOfCreator,
            expectedMockedFunctionArgs: [roleProof, 'creator']
        },
        {
            serviceFunctionName: 'registerMaterial',
            serviceFunction: () => materialService.registerMaterial(roleProof, 1),
            expectedMockedFunction: mockedMaterialDriver.registerMaterial,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => materialService.updateMaterial(roleProof, 1, 2),
            expectedMockedFunction: mockedMaterialDriver.updateMaterial,
            expectedMockedFunctionArgs: [roleProof, 1, 2]
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
