import { createMock } from 'ts-auto-mock';
import { AssetOperationDriver } from '../drivers/AssetOperationDriver';
import { AssetOperationService } from './AssetOperationService';
import { RoleProof } from '../types/RoleProof';

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
        updateAssetOperation: jest.fn()
    });

    const assetOperationService = new AssetOperationService(mockedAssetOperationDriver);

    const roleProof: RoleProof = {
        signedProof: 'signedProof',
        delegator: 'delegator'
    };

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it.each([
        {
            serviceFunctionName: 'getAssetOperationsCounter',
            serviceFunction: () => assetOperationService.getAssetOperationsCounter(roleProof),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationsCounter,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getAssetOperationExists',
            serviceFunction: () => assetOperationService.getAssetOperationExists(roleProof, 1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationExists,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getAssetOperation',
            serviceFunction: () => assetOperationService.getAssetOperation(roleProof, 1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperation,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getAssetOperations',
            serviceFunction: () => assetOperationService.getAssetOperations(roleProof),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperations,
            expectedMockedFunctionArgs: [roleProof]
        },
        {
            serviceFunctionName: 'getAssetOperationType',
            serviceFunction: () => assetOperationService.getAssetOperationType(roleProof, 1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationType,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'getAssetOperationsOfCreator',
            serviceFunction: () =>
                assetOperationService.getAssetOperationsOfCreator(roleProof, 'creator'),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationsOfCreator,
            expectedMockedFunctionArgs: [roleProof, 'creator']
        },
        {
            serviceFunctionName: 'getAssetOperationsByOutputMaterial',
            serviceFunction: () =>
                assetOperationService.getAssetOperationsByOutputMaterial(roleProof, 1),
            expectedMockedFunction: mockedAssetOperationDriver.getAssetOperationsByOutputMaterial,
            expectedMockedFunctionArgs: [roleProof, 1]
        },
        {
            serviceFunctionName: 'registerAssetOperation',
            serviceFunction: () =>
                assetOperationService.registerAssetOperation(
                    roleProof,
                    'name',
                    [1, 2],
                    3,
                    '38.8951',
                    '-77.0364',
                    ['processType']
                ),
            expectedMockedFunction: mockedAssetOperationDriver.registerAssetOperation,
            expectedMockedFunctionArgs: [
                roleProof,
                'name',
                [1, 2],
                3,
                '38.8951',
                '-77.0364',
                ['processType']
            ]
        },
        {
            serviceFunctionName: 'updateAssetOperation',
            serviceFunction: () =>
                assetOperationService.updateAssetOperation(
                    roleProof,
                    1,
                    'name',
                    [1, 2],
                    3,
                    '38.8951',
                    '-77.0364',
                    ['processType']
                ),
            expectedMockedFunction: mockedAssetOperationDriver.updateAssetOperation,
            expectedMockedFunctionArgs: [
                roleProof,
                1,
                'name',
                [1, 2],
                3,
                '38.8951',
                '-77.0364',
                ['processType']
            ]
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
