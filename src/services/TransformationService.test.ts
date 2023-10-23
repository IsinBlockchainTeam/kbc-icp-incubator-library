import { createMock } from 'ts-auto-mock';
import { Transformation } from '../entities/Transformation';
import { Material } from '../entities/Material';
import { TransformationDriver } from '../drivers/TransformationDriver';
import { TransformationService } from './TransformationService';

describe('TransformationService', () => {
    let transformationService: TransformationService;

    let mockedTransformationDriver: TransformationDriver;
    const mockedInstance = {
        registerTransformation: jest.fn(),
        updateTransformation: jest.fn(),
        getTransformationsCounter: jest.fn(),
        getTransformationIds: jest.fn(),
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
        mockedTransformationDriver = createMock<TransformationDriver>(mockedInstance);

        transformationService = new TransformationService(mockedTransformationDriver);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'registerTransformation',
            serviceFunction: () => transformationService.registerTransformation(transformations[0].owner, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId),
            expectedMockedFunction: mockedInstance.registerTransformation,
            expectedMockedFunctionArgs: [transformations[0].owner, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId],
        },
        {
            serviceFunctionName: 'updateTransformation',
            serviceFunction: () => transformationService.updateTransformation(transformations[0].id, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId),
            expectedMockedFunction: mockedInstance.updateTransformation,
            expectedMockedFunctionArgs: [transformations[0].id, transformations[0].name, transformations[0].inputMaterials.map((m) => m.id), transformations[0].outputMaterialId],
        },
        {
            serviceFunctionName: 'getTransformationsCounter',
            serviceFunction: () => transformationService.getTransformationsCounter(),
            expectedMockedFunction: mockedInstance.getTransformationsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTransformation',
            serviceFunction: () => transformationService.getTransformation(transformations[0].id),
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
            resource: 'transformation',
            getIdsMockedFunction: mockedInstance.getTransformationIds,
            getResourceMockedFunction: mockedInstance.getTransformation,
            testResources: transformations,
            serviceFunction: () => transformationService.getTransformations(companyAddress),
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
