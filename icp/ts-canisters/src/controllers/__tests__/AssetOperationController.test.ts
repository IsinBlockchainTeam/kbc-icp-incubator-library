import { query, update } from 'azle';
import { AssetOperation } from '../../models/types';
import { AtLeastEditor, AtLeastViewer } from '../../decorators/roles';
import AssetOperationService from '../../services/AssetOperationService';
import AssetOperationController from '../AssetOperationController';

jest.mock('azle');
jest.mock('../../decorators/parties');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AssetOperationService', () => ({
    instance: {
        getAllAssetOperations: jest.fn(),
        getCompanyAssetOperations: jest.fn(),
        getAssetOperation: jest.fn(),
        createAssetOperation: jest.fn(),
        updateAssetOperation: jest.fn(),
        deleteAssetOperation: jest.fn()
    }
}));
describe('AssetOperationController', () => {
    const assetOperationServiceInstanceMock = AssetOperationService.instance as jest.Mocked<AssetOperationService>;
    const assetOperationController = new AssetOperationController();

    it.each([
        {
            controllerFunctionName: 'getAllAssetOperations',
            controllerFunction: () => assetOperationController.getAllAssetOperations(),
            serviceFunction: assetOperationServiceInstanceMock.getAllAssetOperations,
            expectedResult: [{ id: 1n } as AssetOperation],
            expectedArguments: [],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getCompanyAssetOperations',
            controllerFunction: () => assetOperationController.getCompanyAssetOperations('0xcompany'),
            serviceFunction: assetOperationServiceInstanceMock.getCompanyAssetOperations,
            expectedResult: { id: 1n } as AssetOperation,
            expectedArguments: ['0xcompany'],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'getAssetOperation',
            controllerFunction: () => assetOperationController.getAssetOperation(1n),
            serviceFunction: assetOperationServiceInstanceMock.getAssetOperation,
            expectedResult: { id: 1n } as AssetOperation,
            expectedArguments: [1n],
            expectedDecorators: [query, AtLeastViewer]
        },
        {
            controllerFunctionName: 'createAssetOperation',
            controllerFunction: () => assetOperationController.createAssetOperation('name', [1n], 1n, 'latitude', 'longitude', ['processType1']),
            serviceFunction: assetOperationServiceInstanceMock.createAssetOperation,
            expectedResult: { id: 1n } as AssetOperation,
            expectedArguments: ['name', [1n], 1n, 'latitude', 'longitude', ['processType1']],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'updateAssetOperation',
            controllerFunction: () => assetOperationController.updateAssetOperation(1n, 'name', [1n], 1n, 'latitude', 'longitude', ['processType1']),
            serviceFunction: assetOperationServiceInstanceMock.updateAssetOperation,
            expectedResult: { id: 1n } as AssetOperation,
            expectedArguments: [1n, 'name', [1n], 1n, 'latitude', 'longitude', ['processType1']],
            expectedDecorators: [update, AtLeastEditor]
        },
        {
            controllerFunctionName: 'deleteAssetOperation',
            controllerFunction: () => assetOperationController.deleteAssetOperation(1n),
            serviceFunction: assetOperationServiceInstanceMock.deleteAssetOperation,
            expectedResult: { id: 1n } as AssetOperation,
            expectedArguments: [1n],
            expectedDecorators: [update, AtLeastEditor]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
