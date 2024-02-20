import { createMock } from 'ts-auto-mock';
import { AssetOperationDriver } from '../drivers/AssetOperationDriver';
import { AssetOperationService } from './AssetOperationService';

describe('AssetOperationService', () => {
    const mockedAssetOperationDriver: AssetOperationDriver = createMock<AssetOperationDriver>({
        getAssetOperationsCounter: jest.fn(),
        getAssetOperationExists: jest.fn(),
        getAssetOperation: jest.fn(),
        getAssetOperations: jest.fn(),
        getAssetOperationType: jest.fn(),
        getAssetOperationsOfCreator: jest.fn(),
        getAssetOperationsByOutputMaterial: jest.fn(),
        registerAssetOperation: jest.fn(),
        updateAssetOperation: jest.fn(),
    });

    const assetOperationService = new AssetOperationService(
        mockedAssetOperationDriver,
    );

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getAssetOperationsCounter',
            serviceFunction: () => assetOperationService.getAssetOperationsCounter(),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationsCounter,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getAssetOperationExists',
            serviceFunction: () => assetOperationService.getAssetOperationExists(1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationExists,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getAssetOperation',
            serviceFunction: () => assetOperationService.getAssetOperation(1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperation,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getAssetOperations',
            serviceFunction: () => assetOperationService.getAssetOperations(),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperations,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getAssetOperationType',
            serviceFunction: () => assetOperationService.getAssetOperationType(1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationType,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getAssetOperationsOfCreator',
            serviceFunction: () => assetOperationService.getAssetOperationsOfCreator('creator'),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationsOfCreator,
            expectedMockedFunctionArgs: ['creator'],
        },
        {
            serviceFunctionName: 'getAssetOperationsByOutputMaterial',
            serviceFunction: () => assetOperationService.getAssetOperationsByOutputMaterial(1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationsByOutputMaterial,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'registerAssetOperation',
            serviceFunction: () => assetOperationService.registerAssetOperation('name', [1, 2], 3, '38.8951', '-77.0364'),
            expectedMockedFunction: mockedAssetOperationDriver.registerAssetOperation,
            expectedMockedFunctionArgs: ['name', [1, 2], 3, '38.8951', '-77.0364'],
        },
        {
            serviceFunctionName: 'updateAssetOperation',
            serviceFunction: () => assetOperationService.updateAssetOperation(1, 'name', [1, 2], 3, '38.8951', '-77.0364'),
            expectedMockedFunction: mockedAssetOperationDriver.updateAssetOperation,
            expectedMockedFunctionArgs: [1, 'name', [1, 2], 3, '38.8951', '-77.0364'],
        },
    ])('service should call driver $serviceFunctionName', async ({
        serviceFunction,
        expectedMockedFunction,
        expectedMockedFunctionArgs,
    }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});
