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
        getTransformationsCounter: jest.fn(),
        getMaterial: jest.fn(),
        getTransformation: jest.fn(),
    };

    const materials = [
        new Material(1, 'material1', 'owner'),
        new Material(2, 'material2', 'owner'),
        new Material(3, 'material3', 'owner'),
        new Material(4, 'material4', 'owner'),
    ];
    const transformation = new Transformation(1, 'Transformation 1', [materials[0], materials[1]], 3, 'Owner');
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
            serviceFunction: () => supplyChainService.registerTransformation(transformation.owner, transformation.name, transformation.inputMaterials.map((m) => m.id), transformation.outputMaterialId),
            expectedMockedFunction: mockedInstance.registerTransformation,
            expectedMockedFunctionArgs: [transformation.owner, transformation.name, transformation.inputMaterials.map((m) => m.id), transformation.outputMaterialId],
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => supplyChainService.updateMaterial(materials[1].id, materials[1].name),
            expectedMockedFunction: mockedInstance.updateMaterial,
            expectedMockedFunctionArgs: [materials[1].id, materials[1].name],
        },
        {
            serviceFunctionName: 'updateTransformation',
            serviceFunction: () => supplyChainService.updateTransformation(transformation.id, transformation.name, transformation.inputMaterials.map((m) => m.id), transformation.outputMaterialId),
            expectedMockedFunction: mockedInstance.updateTransformation,
            expectedMockedFunctionArgs: [transformation.id, transformation.name, transformation.inputMaterials.map((m) => m.id), transformation.outputMaterialId],
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
            serviceFunction: () => supplyChainService.getTransformation(transformation.id),
            expectedMockedFunction: mockedInstance.getTransformation,
            expectedMockedFunctionArgs: [transformation.id],
        },
    ])('service should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });

    it.each([
        {
            resource: 'material',
            getCounterMockedFunction: mockedInstance.getMaterialsCounter,
            getResourceMockedFunction: mockedInstance.getMaterial,
            testResource: materials[0],
            serviceFunction: () => supplyChainService.getMaterials(companyAddress),
        },
        {
            resource: 'transformation',
            getCounterMockedFunction: mockedInstance.getTransformationsCounter,
            getResourceMockedFunction: mockedInstance.getTransformation,
            testResource: transformation,
            serviceFunction: () => supplyChainService.getTransformations(companyAddress),
        },
    ])('should retrieve all the $resource', async ({ resource, getCounterMockedFunction, getResourceMockedFunction, testResource, serviceFunction }) => {
        getCounterMockedFunction.mockReturnValue(2);
        getResourceMockedFunction.mockReturnValueOnce(testResource);
        getResourceMockedFunction.mockReturnValueOnce(testResource);

        const response = await serviceFunction();

        expect(response).toHaveLength(2);
        expect(response[0]).toEqual(testResource);
        expect(response[1]).toEqual(testResource);

        expect(getCounterMockedFunction).toHaveBeenCalledTimes(1);
        expect(getResourceMockedFunction).toHaveBeenCalledTimes(2);
        expect(getResourceMockedFunction).toHaveBeenNthCalledWith(1, testResource.owner, 1);
        expect(getResourceMockedFunction).toHaveBeenNthCalledWith(2, testResource.owner, 2);
    });
});
