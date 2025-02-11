import { createMock } from 'ts-auto-mock';
import { AssetOperationService } from '../AssetOperationService';
import { AssetOperationDriver, AssetOperationParams } from '../../drivers/AssetOperationDriver';
import { AssetOperation } from '../../entities/AssetOperation';

describe('AssetOperationService', () => {
    let assetOperationService: AssetOperationService;
    const mockedAssetOperationDriverFn = {
        getAllAssetOperations: jest.fn(),
        getCompanyAssetOperations: jest.fn(),
        getAssetOperation: jest.fn(),
        createAssetOperation: jest.fn(),
        updateAssetOperation: jest.fn(),
        deleteAssetOperation: jest.fn()
    };

    const assetOperationParams: AssetOperationParams = {
        name: 'name',
        inputMaterialIds: [1, 2],
        outputMaterialId: 3,
        latitude: 'latitude',
        longitude: 'longitude',
        processTypes: ['processType1']
    };

    beforeAll(() => {
        const assetOperationDriver = createMock<AssetOperationDriver>(mockedAssetOperationDriverFn);
        assetOperationService = new AssetOperationService(assetOperationDriver);
    });

    it.each([
        {
            functionName: 'getAllAssetOperations',
            serviceFunction: () => assetOperationService.getAllAssetOperations(),
            driverFunction: mockedAssetOperationDriverFn.getAllAssetOperations,
            driverFunctionResult: [{} as AssetOperation],
            driverFunctionArgs: []
        },
        {
            functionName: 'getCompanyAssetOperations',
            serviceFunction: () => assetOperationService.getCompanyAssetOperations('0xcompany'),
            driverFunction: mockedAssetOperationDriverFn.getCompanyAssetOperations,
            driverFunctionResult: [{} as AssetOperation],
            driverFunctionArgs: ['0xcompany']
        },
        {
            functionName: 'getAssetOperation',
            serviceFunction: () => assetOperationService.getAssetOperation(1),
            driverFunction: mockedAssetOperationDriverFn.getAssetOperation,
            driverFunctionResult: {} as AssetOperation,
            driverFunctionArgs: [1]
        },
        {
            functionName: 'createAssetOperation',
            serviceFunction: () => assetOperationService.createAssetOperation(assetOperationParams),
            driverFunction: mockedAssetOperationDriverFn.createAssetOperation,
            driverFunctionResult: {} as AssetOperation,
            driverFunctionArgs: [assetOperationParams]
        },
        {
            functionName: 'updateAssetOperation',
            serviceFunction: () =>
                assetOperationService.updateAssetOperation(1, assetOperationParams),
            driverFunction: mockedAssetOperationDriverFn.updateAssetOperation,
            driverFunctionResult: {} as AssetOperation,
            driverFunctionArgs: [1, assetOperationParams]
        },
        {
            functionName: 'deleteAssetOperation',
            serviceFunction: () => assetOperationService.deleteAssetOperation(1),
            driverFunction: mockedAssetOperationDriverFn.deleteAssetOperation,
            driverFunctionResult: {} as AssetOperation,
            driverFunctionArgs: [1]
        }
    ])(
        `should call driver function $functionName`,
        async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
            driverFunction.mockReturnValue(driverFunctionResult);
            await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
            expect(driverFunction).toHaveBeenCalled();
            expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
        }
    );
});
