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

    const material = new Material(1, 'Material 1', 'Owner');
    const transformation = new Transformation(1, 'Transformation 1', [1, 2], 3, 'Owner');

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
            serviceFunction: () => supplyChainService.registerMaterial(material.owner, material.name),
            expectedMockedFunction: mockedInstance.registerMaterial,
            expectedMockedFunctionArgs: [material.owner, material.name],
        },
        {
            serviceFunctionName: 'registerTransformation',
            serviceFunction: () => supplyChainService.registerTransformation(transformation.owner, transformation.name, transformation.inputMaterialsIds, transformation.outputMaterialId),
            expectedMockedFunction: mockedInstance.registerTransformation,
            expectedMockedFunctionArgs: [transformation.owner, transformation.name, transformation.inputMaterialsIds, transformation.outputMaterialId],
        },
        {
            serviceFunctionName: 'updateMaterial',
            serviceFunction: () => supplyChainService.updateMaterial(material.owner, material.id, material.name),
            expectedMockedFunction: mockedInstance.updateMaterial,
            expectedMockedFunctionArgs: [material.owner, material.id, material.name],
        },
        {
            serviceFunctionName: 'updateTransformation',
            serviceFunction: () => supplyChainService.updateTransformation(transformation.owner, transformation.id, transformation.name, transformation.inputMaterialsIds, transformation.outputMaterialId),
            expectedMockedFunction: mockedInstance.updateTransformation,
            expectedMockedFunctionArgs: [transformation.owner, transformation.id, transformation.name, transformation.inputMaterialsIds, transformation.outputMaterialId],
        },
        {
            serviceFunctionName: 'getMaterialsCounter',
            serviceFunction: () => supplyChainService.getMaterialsCounter(material.owner),
            expectedMockedFunction: mockedInstance.getMaterialsCounter,
            expectedMockedFunctionArgs: [material.owner],
        },
        {
            serviceFunctionName: 'getTransformationsCounter',
            serviceFunction: () => supplyChainService.getTransformationsCounter(transformation.owner),
            expectedMockedFunction: mockedInstance.getTransformationsCounter,
            expectedMockedFunctionArgs: [transformation.owner],
        },
        {
            serviceFunctionName: 'getMaterial',
            serviceFunction: () => supplyChainService.getMaterial(material.owner, material.id),
            expectedMockedFunction: mockedInstance.getMaterial,
            expectedMockedFunctionArgs: [material.owner, material.id],
        },
        {
            serviceFunctionName: 'getTransformation',
            serviceFunction: () => supplyChainService.getTransformation(transformation.owner, transformation.id),
            expectedMockedFunction: mockedInstance.getTransformation,
            expectedMockedFunctionArgs: [transformation.owner, transformation.id],
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
            testResource: material,
            serviceFunction: () => supplyChainService.getMaterials(material.owner),
        },
        {
            resource: 'transformation',
            getCounterMockedFunction: mockedInstance.getTransformationsCounter,
            getResourceMockedFunction: mockedInstance.getTransformation,
            testResource: transformation,
            serviceFunction: () => supplyChainService.getTransformations(material.owner),
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
        expect(getResourceMockedFunction).toHaveBeenNthCalledWith(1, testResource.owner, 0);
        expect(getResourceMockedFunction).toHaveBeenNthCalledWith(2, testResource.owner, 1);
    });
});
