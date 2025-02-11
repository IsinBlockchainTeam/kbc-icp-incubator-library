import { StableBTreeMap } from 'azle';
import AssetOperationService from '../AssetOperationService';
import AuthenticationService from '../AuthenticationService';
import { AssetOperation, ErrorType } from '../../models/types';
import { validateMaterialById } from '../../utils/validation';

jest.mock('azle');
jest.mock('../../services/AuthenticationService', () => ({
    instance: {
        getDelegatorAddress: jest.fn(),
        getRole: jest.fn()
    }
}));
jest.mock('../../utils/validation', () => ({
    validateProcessTypes: jest.fn(),
    validateMaterialById: jest.fn()
}));

describe('AssetOperationService', () => {
    let assetOperationService: AssetOperationService;
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;

    const loggedCompany = 'company';

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn(),
        remove: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert,
            remove: mockedFn.remove
        });
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(loggedCompany);

        assetOperationService = AssetOperationService.instance;
    });

    afterEach(() => {
        jest.clearAllMocks();
        jest.restoreAllMocks();
    });

    describe('getAllAssetOperations', () => {
        it('should return all asset operations', () => {
            const assetOperations = [{ id: 1 }, { id: 2 }];
            mockedFn.values.mockReturnValue(assetOperations);
            expect(assetOperationService.getAllAssetOperations()).toEqual(assetOperations);
        });
    });

    describe('getCompanyAssetOperations', () => {
        it('should return company asset operations', () => {
            const company = 'company';
            const companyAssetOperationIds = [1n, 2n];
            const assetOperations = [{ id: 1n }, { id: 2n }];
            jest.spyOn(assetOperationService, 'getAssetOperation').mockImplementation((id: bigint) => assetOperations.find((assetOperation) => assetOperation.id === id) as AssetOperation);
            mockedFn.get.mockReturnValueOnce(companyAssetOperationIds);

            expect(assetOperationService.getCompanyAssetOperations(company)).toEqual(assetOperations);
            expect(mockedFn.get).toHaveBeenCalledWith(company);
        });
    });

    describe('getAssetOperation', () => {
        it('should return asset operation', () => {
            const id = 1n;
            const assetOperation = { id };
            mockedFn.get.mockReturnValue(assetOperation);

            expect(assetOperationService.getAssetOperation(id)).toEqual(assetOperation);
            expect(mockedFn.get).toHaveBeenCalledWith(id);
        });

        it('should throw an error if asset operation not found', () => {
            const id = 1n;
            mockedFn.get.mockReturnValue(null);
            expect(() => assetOperationService.getAssetOperation(id)).toThrow(`(${ErrorType.ASSET_OPERATION_NOT_FOUND}) Asset operation not found.`);
        });
    });

    describe('createAssetOperation', () => {
        it('should create an asset operation', () => {
            const name = 'name';
            const latitude = '9.85165';
            const longitude = '4.7842';
            const inputMaterialIds = [1n, 2n];
            const outputMaterialId = 3n;
            const processTypes = ['type1', 'type2'];
            const inputMaterials = [{ id: 1n }, { id: 2n }];
            const outputMaterial = { id: 3n };
            const assetOperation = {
                id: 0n,
                name,
                inputMaterials,
                outputMaterial,
                latitude,
                longitude,
                processTypes
            };
            (validateMaterialById as jest.Mock).mockImplementation((id) => [...inputMaterials, outputMaterial].find((material) => material.id === id));
            mockedFn.keys.mockReturnValue([]);
            mockedFn.get.mockReturnValue(null);

            expect(assetOperationService.createAssetOperation(name, inputMaterialIds, outputMaterialId, latitude, longitude, processTypes)).toEqual(assetOperation);
            expect(mockedFn.insert).toHaveBeenCalledTimes(2);
            expect(mockedFn.insert).toHaveBeenNthCalledWith(1, loggedCompany, [assetOperation.id]);
            expect(mockedFn.insert).toHaveBeenNthCalledWith(2, assetOperation.id, assetOperation);
        });
    });

    describe('updateAssetOperation', () => {
        it('should update an asset operation', () => {
            const id = 1n;
            const name = 'name';
            const latitude = '9.85165';
            const longitude = '4.7842';
            const inputMaterialIds = [1n, 2n];
            const outputMaterialId = 3n;
            const processTypes = ['type1', 'type2'];
            const inputMaterials = [{ id: 1n }, { id: 2n }];
            const outputMaterial = { id: 3n };
            const assetOperation = {
                id,
                name,
                inputMaterials,
                outputMaterial,
                latitude,
                longitude,
                processTypes
            };
            (validateMaterialById as jest.Mock).mockImplementation((id) => [...inputMaterials, outputMaterial].find((material) => material.id === id));
            mockedFn.get.mockReturnValue(assetOperation);

            expect(assetOperationService.updateAssetOperation(id, name, inputMaterialIds, outputMaterialId, latitude, longitude, processTypes)).toEqual(assetOperation);
            expect(mockedFn.insert).toHaveBeenCalledWith(id, assetOperation);
        });

        it('should throw an error if asset operation not found', () => {
            const id = 1n;
            mockedFn.get.mockReturnValue(null);
            expect(() => assetOperationService.updateAssetOperation(id, 'name', [1n], 2n, '9.85165', '4.7842', ['type1', 'type2'])).toThrow(
                `(${ErrorType.ASSET_OPERATION_NOT_FOUND}) Asset operation not found.`
            );
        });
    });

    describe('deleteAssetOperation', () => {
        it('should delete an asset operation', () => {
            const id = 1n;
            const assetOperation = { id } as AssetOperation;
            jest.spyOn(assetOperationService, 'getAssetOperation').mockReturnValueOnce(assetOperation);

            expect(assetOperationService.deleteAssetOperation(id)).toEqual(assetOperation);
            expect(mockedFn.get).toHaveBeenCalledWith(loggedCompany);
            expect(mockedFn.insert).toHaveBeenCalledWith(loggedCompany, []);
            expect(mockedFn.remove).toHaveBeenCalledWith(id);
        });
    });
});
