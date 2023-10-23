import { createMock } from 'ts-auto-mock';
import { SupplyChainService } from './SupplyChainService';
import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import { Material } from '../entities/Material';

describe('SupplyChainService', () => {
    let supplyChainService: SupplyChainService;

    let mockedSupplyChainDriver: SupplyChainDriver;
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
        mockedSupplyChainDriver = createMock<SupplyChainDriver>(mockedInstance);

        supplyChainService = new SupplyChainService(mockedSupplyChainDriver);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerMaterial',
            serviceFunction: () => supplyChainService.registerMaterial(materials[0].owner, materials[0].name),
            expectedMockedFunction: mockedInstance.registerMaterial,
            expectedMockedFunctionArgs: [materials[0].owner, materials[0].name],
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => supplyChainService.updateMaterial(materials[1].id, materials[1].name),
            expectedMockedFunction: mockedInstance.updateMaterial,
            expectedMockedFunctionArgs: [materials[1].id, materials[1].name],
        },
        {
            serviceFunctionName: 'getMaterialsCounter',
            serviceFunction: () => supplyChainService.getMaterialsCounter(),
            expectedMockedFunction: mockedInstance.getMaterialsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getMaterial',
            serviceFunction: () => supplyChainService.getMaterial(materials[0].id),
            expectedMockedFunction: mockedInstance.getMaterial,
            expectedMockedFunctionArgs: [materials[0].id],
        },
    ])('service should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it.each([
        {
            resource: 'material',
            getIdsMockedFunction: mockedInstance.getMaterialIds,
            getResourceMockedFunction: mockedInstance.getMaterial,
            testResources: [materials[0], materials[1]],
            serviceFunction: () => supplyChainService.getMaterials(companyAddress),
        },
    ])('should retrieve all the $resource', async ({ resource, getIdsMockedFunction, getResourceMockedFunction, testResources, serviceFunction }) => {
        getIdsMockedFunction.mockReturnValue([testResources[0].id, testResources[1].id]);
        getResourceMockedFunction.mockResolvedValueOnce(testResources[0]);
        getResourceMockedFunction.mockResolvedValueOnce(testResources[1]);

        const response = await serviceFunction();

        expect(response).toHaveLength(2);
        expect(response[0]).toEqual(testResources[0]);
        expect(response[1]).toEqual(testResources[1]);

        expect(getIdsMockedFunction).toHaveBeenCalledTimes(1);
        expect(getResourceMockedFunction).toHaveBeenCalledTimes(2);
        expect(getResourceMockedFunction).toHaveBeenNthCalledWith(1, testResources[0].id);
        expect(getResourceMockedFunction).toHaveBeenNthCalledWith(2, testResources[1].id);
    });
});
