import { createMock } from 'ts-auto-mock';
import { SupplyChainService } from './SupplyChainService';
import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import { Material } from '../entities/Material';
import { Trade } from '../entities/Trade';
import { Transformation } from '../entities/Transformation';

describe('SupplyChainService', () => {
    let supplyChainService: SupplyChainService;

    let mockedSupplyChainDriver: SupplyChainDriver;
    const mockedInstance = {
        registerMaterial: jest.fn(),
        registerTrade: jest.fn(),
        registerTransformation: jest.fn(),
        updateMaterial: jest.fn(),
        updateTrade: jest.fn(),
        updateTransformation: jest.fn(),
        getMaterialsCounter: jest.fn(),
        getTradesCounter: jest.fn(),
        getTransformationsCounter: jest.fn(),
        getMaterial: jest.fn(),
        getTrade: jest.fn(),
        getTransformation: jest.fn(),
    };

    const material = new Material(1, 'Material 1', 'Owner');
    const trade = new Trade(1, 'Trade 1', [[1, 2], [3, 4]], 'Owner');
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
            serviceFunctionName: 'registerTrade',
            serviceFunction: () => supplyChainService.registerTrade(trade.owner, trade.name, trade.materialsIds),
            expectedMockedFunction: mockedInstance.registerTrade,
            expectedMockedFunctionArgs: [trade.owner, trade.name, trade.materialsIds],
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
            serviceFunctionName: 'updateTrade',
            serviceFunction: () => supplyChainService.updateTrade(trade.owner, trade.id, trade.name, trade.materialsIds),
            expectedMockedFunction: mockedInstance.updateTrade,
            expectedMockedFunctionArgs: [trade.owner, trade.id, trade.name, trade.materialsIds],
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
            serviceFunctionName: 'getTradesCounter',
            serviceFunction: () => supplyChainService.getTradesCounter(trade.owner),
            expectedMockedFunction: mockedInstance.getTradesCounter,
            expectedMockedFunctionArgs: [trade.owner],
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
            serviceFunctionName: 'getTrade',
            serviceFunction: () => supplyChainService.getTrade(trade.owner, trade.id),
            expectedMockedFunction: mockedInstance.getTrade,
            expectedMockedFunctionArgs: [trade.owner, trade.id],
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
            resource: 'trade',
            getCounterMockedFunction: mockedInstance.getTradesCounter,
            getResourceMockedFunction: mockedInstance.getTrade,
            testResource: trade,
            serviceFunction: () => supplyChainService.getTrades(material.owner),
        },
        {
            resource: 'transformation',
            getCounterMockedFunction: mockedInstance.getTransformationsCounter,
            getResourceMockedFunction: mockedInstance.getTransformation,
            testResource: transformation,
            serviceFunction: () => supplyChainService.getTransformations(material.owner),
        },
    ])('should retrieve all the $resource', async ({
        resource, getCounterMockedFunction, getResourceMockedFunction, testResource, serviceFunction,
    }) => {
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
