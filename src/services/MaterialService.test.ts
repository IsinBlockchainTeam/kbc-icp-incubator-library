import { createMock } from 'ts-auto-mock';
import { MaterialService } from './MaterialService';
import { MaterialDriver } from '../drivers/MaterialDriver';
import { Material } from '../entities/Material';

describe('MaterialService', () => {
    let materialService: MaterialService;

    let mockedMaterialDriver: MaterialDriver;
    const mockedInstance = {
        registerMaterial: jest.fn(),
        updateMaterial: jest.fn(),
        getMaterialsCounter: jest.fn(),
        getMaterialIds: jest.fn(),
        getMaterial: jest.fn(),
    };

    const materials = [
        new Material(1, 'material1', 'owner'),
        new Material(2, 'material2', 'owner'),
        new Material(3, 'material3', 'owner'),
        new Material(4, 'material4', 'owner'),
        new Material(5, 'material5', 'owner'),
    ];
    const companyAddress = '0xaddress';

    beforeAll(() => {
        mockedMaterialDriver = createMock<MaterialDriver>(mockedInstance);

        materialService = new MaterialService(mockedMaterialDriver);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerMaterial',
            serviceFunction: () => materialService.registerMaterial(materials[0].owner, materials[0].name),
            expectedMockedFunction: mockedInstance.registerMaterial,
            expectedMockedFunctionArgs: [materials[0].owner, materials[0].name],
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => materialService.updateMaterial(materials[1].id, materials[1].name),
            expectedMockedFunction: mockedInstance.updateMaterial,
            expectedMockedFunctionArgs: [materials[1].id, materials[1].name],
        },
        {
            serviceFunctionName: 'getMaterialsCounter',
            serviceFunction: () => materialService.getMaterialsCounter(),
            expectedMockedFunction: mockedInstance.getMaterialsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getMaterial',
            serviceFunction: () => materialService.getMaterial(materials[0].id),
            expectedMockedFunction: mockedInstance.getMaterial,
            expectedMockedFunctionArgs: [materials[0].id],
        },
    ])('service should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it('should retrieve all the materials', async () => {
        mockedInstance.getMaterialIds.mockReturnValue([materials[0].id, materials[1].id]);
        mockedInstance.getMaterial.mockResolvedValueOnce(materials[0]);
        mockedInstance.getMaterial.mockResolvedValueOnce(materials[1]);

        const response = await materialService.getMaterials(companyAddress);

        expect(response).toHaveLength(2);
        expect(response[0]).toEqual(materials[0]);
        expect(response[1]).toEqual(materials[1]);

        expect(mockedInstance.getMaterialIds).toHaveBeenCalledTimes(1);
        expect(mockedInstance.getMaterial).toHaveBeenCalledTimes(2);
        expect(mockedInstance.getMaterial).toHaveBeenNthCalledWith(1, materials[0].id);
        expect(mockedInstance.getMaterial).toHaveBeenNthCalledWith(2, materials[1].id);
    });
});
