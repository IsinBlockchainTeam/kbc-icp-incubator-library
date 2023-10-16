import { createMock } from 'ts-auto-mock';
import { SupplyChainService } from './SupplyChainService';
import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import { Material } from '../entities/Material';
import { Transformation } from '../entities/Transformation';

describe('SupplyChainService', () => {
    let supplyChainService: SupplyChainService;

    let mockedSupplyChainDriver: SupplyChainDriver;
    const mockedInstance = {
        registerMaterial: jest.fn(),
        registerTransformation: jest.fn(),
        updateMaterial: jest.fn(),
        updateTransformation: jest.fn(),
        getMaterialsCounter: jest.fn(),
        getMaterialIds: jest.fn(),
        getTransformationsCounter: jest.fn(),
        getTransformationIds: jest.fn(),
        getMaterial: jest.fn(),
        getTransformation: jest.fn(),
    };

    const materials = [
        new Material(1, 'material1', 'owner'),
        new Material(2, 'material2', 'owner'),
        new Material(3, 'material3', 'owner'),
        new Material(4, 'material4', 'owner'),
        new Material(5, 'material5', 'owner'),
    ];
    const transformations = [
        new Transformation(1, 'Transformation 1', [materials[0], materials[1]], 3, 'Owner'),
        new Transformation(2, 'Transformation 2', [materials[2], materials[3]], 5, 'Owner'),
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
            serviceFunctionName: 'registerTransformation',
            serviceFunction: () => supplyChainService.registerTransformation(transformations[0].owner, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId),
            expectedMockedFunction: mockedInstance.registerTransformation,
            expectedMockedFunctionArgs: [transformations[0].owner, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId],
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => supplyChainService.updateMaterial(materials[1].id, materials[1].name),
            expectedMockedFunction: mockedInstance.updateMaterial,
            expectedMockedFunctionArgs: [materials[1].id, materials[1].name],
        },
        {
            serviceFunctionName: 'updateTransformation',
            serviceFunction: () => supplyChainService.updateTransformation(transformations[0].id, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId),
            expectedMockedFunction: mockedInstance.updateTransformation,
            expectedMockedFunctionArgs: [transformations[0].id, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId],
        },
        {
            serviceFunctionName: 'getMaterialsCounter',
            serviceFunction: () => supplyChainService.getMaterialsCounter(),
            expectedMockedFunction: mockedInstance.getMaterialsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTransformationsCounter',
            serviceFunction: () => supplyChainService.getTransformationsCounter(),
            expectedMockedFunction: mockedInstance.getTransformationsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getMaterial',
            serviceFunction: () => supplyChainService.getMaterial(materials[0].id),
            expectedMockedFunction: mockedInstance.getMaterial,
            expectedMockedFunctionArgs: [materials[0].id],
        },
        {
            serviceFunctionName: 'getTransformation',
            serviceFunction: () => supplyChainService.getTransformation(transformations[0].id),
            expectedMockedFunction: mockedInstance.getTransformation,
            expectedMockedFunctionArgs: [transformations[0].id],
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
        {
            resource: 'transformation',
            getIdsMockedFunction: mockedInstance.getTransformationIds,
            getResourceMockedFunction: mockedInstance.getTransformation,
            testResources: transformations,
            serviceFunction: () => supplyChainService.getTransformations(companyAddress),
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
