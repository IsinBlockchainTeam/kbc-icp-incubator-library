import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EntityBuilder } from '../utils/EntityBuilder';
import {
    AssetOperationManager,
    AssetOperationManager__factory,
    MaterialManager,
    MaterialManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory
} from '../smart-contracts';
import { AssetOperation } from '../entities/AssetOperation';
import { AssetOperationDriver } from './AssetOperationDriver';
import { AssetOperationType } from '../types/AssetOperationType';
import { ProductCategory } from '../entities/ProductCategory';
import { Material } from '../entities/Material';
import { RoleProof } from '../types/RoleProof';

describe('AssetOperationDriver', () => {
    let assetOperationDriver: AssetOperationDriver;
    const companyAddress: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;

    const roleProof: RoleProof = createMock<RoleProof>();

    const materialStruct: MaterialManager.MaterialStructOutput = {
        id: BigNumber.from(1),
        productCategoryId: BigNumber.from(2),
        exists: true
    } as MaterialManager.MaterialStructOutput;
    const productCategoryStruct: ProductCategoryManager.ProductCategoryStructOutput = {
        id: BigNumber.from(2),
        name: 'category1',
        quality: 85,
        description: 'description',
        exists: true
    } as ProductCategoryManager.ProductCategoryStructOutput;
    const assetOperationStruct: AssetOperationManager.AssetOperationStructOutput = {
        id: BigNumber.from(1),
        name: 'asset operation',
        inputMaterialIds: [BigNumber.from(1), BigNumber.from(2)],
        outputMaterialId: BigNumber.from(3),
        latitude: '46.003677',
        longitude: '8.953062',
        exists: true
    } as AssetOperationManager.AssetOperationStructOutput;
    const processTypes: string[] = ['process type1', 'process type2'];

    let mockedSigner: Signer;

    const mockedAssetOperationManagerConnect = jest.fn();
    const mockedMaterialManagerConnect = jest.fn();
    const mockedProductCategoryManagerConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetAssetOperationCounter = jest.fn();
    const mockedGetAssetOperationExists = jest.fn();
    const mockedGetAssetOperationIdsOfCreator = jest.fn();
    const mockedGetAssetOperation = jest.fn();
    const mockedGetAssetOperationType = jest.fn();

    const mockedAssetOperation = new AssetOperation(
        1,
        'asset operation',
        [
            new Material(1, new ProductCategory(1, 'category1', 85, 'description')),
            new Material(2, new ProductCategory(2, 'category1', 85, 'description'))
        ],
        new Material(3, new ProductCategory(3, 'category1', 85, 'description')),
        '46.003677',
        '8.953062',
        processTypes
    );

    const mockedGetMaterial = jest.fn();
    const mockedGetProductCategory = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });
    mockedGetAssetOperationCounter.mockResolvedValue({
        toNumber: mockedToNumber
    });
    mockedGetAssetOperationExists.mockReturnValue(true);
    mockedGetAssetOperationIdsOfCreator.mockResolvedValue([BigNumber.from(1)]);
    mockedGetAssetOperation.mockReturnValue(assetOperationStruct);
    mockedGetAssetOperationType.mockReturnValue(0);

    mockedGetMaterial.mockReturnValue(materialStruct);
    mockedGetProductCategory.mockReturnValue(productCategoryStruct);

    const mockedContract = createMock<AssetOperationManager>({
        getAssetOperationsCounter: mockedGetAssetOperationCounter,
        getAssetOperationExists: mockedGetAssetOperationExists,
        getAssetOperationIdsOfCreator: mockedGetAssetOperationIdsOfCreator,
        getAssetOperation: mockedGetAssetOperation,
        getAssetOperationType: mockedGetAssetOperationType,
        registerAssetOperation: mockedWriteFunction,
        updateAssetOperation: mockedWriteFunction
    });

    const mockedMaterialContract = createMock<MaterialManager>({
        getMaterial: mockedGetMaterial
    });
    const mockedProductCategoryContract = createMock<ProductCategoryManager>({
        getProductCategory: mockedGetProductCategory
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedAssetOperationManagerConnect.mockReturnValue(mockedContract);
        const mockedAssetOperationManager = createMock<AssetOperationManager>({
            connect: mockedAssetOperationManagerConnect
        });
        mockedMaterialManagerConnect.mockReturnValue(mockedMaterialContract);
        const mockedMaterialManagerContract = createMock<MaterialManager>({
            connect: mockedMaterialManagerConnect
        });
        mockedProductCategoryManagerConnect.mockReturnValue(mockedProductCategoryContract);
        const mockedProductCategoryManagerContract = createMock<ProductCategoryManager>({
            connect: mockedProductCategoryManagerConnect
        });

        jest.spyOn(AssetOperationManager__factory, 'connect').mockReturnValue(
            mockedAssetOperationManager
        );
        jest.spyOn(MaterialManager__factory, 'connect').mockReturnValue(
            mockedMaterialManagerContract
        );
        jest.spyOn(ProductCategoryManager__factory, 'connect').mockReturnValue(
            mockedProductCategoryManagerContract
        );

        const buildAssetOperationSpy = jest.spyOn(EntityBuilder, 'buildAssetOperation');
        buildAssetOperationSpy.mockReturnValue(mockedAssetOperation);

        mockedSigner = createMock<Signer>();
        assetOperationDriver = new AssetOperationDriver(
            mockedSigner,
            contractAddress,
            Wallet.createRandom().address,
            Wallet.createRandom().address
        );
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should correctly register a new AssetOperation', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'AssetOperationRegistered',
                    args: {
                        id: BigNumber.from(1)
                    }
                }
            ]
        });
        await assetOperationDriver.registerAssetOperation(
            roleProof,
            'test',
            [1, 2],
            3,
            '38.8951',
            '-77.0364',
            processTypes
        );

        expect(mockedContract.registerAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerAssetOperation).toHaveBeenNthCalledWith(
            1,
            roleProof,
            'test',
            [1, 2],
            3,
            '38.8951',
            '-77.0364',
            processTypes
        );

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new AssetOperation - FAIL(Error during asset operation registration, no events found)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: undefined
        });
        await expect(
            assetOperationDriver.registerAssetOperation(
                roleProof,
                'test',
                [1, 2],
                3,
                '38.8951',
                '-77.0364',
                processTypes
            )
        ).rejects.toThrow('Error during asset operation registration, no events found');
    });

    it('should correctly update an AssetOperation', async () => {
        await assetOperationDriver.updateAssetOperation(
            roleProof,
            1,
            'update',
            [1, 2],
            3,
            '38.8951',
            '-77.0364',
            processTypes
        );

        expect(mockedContract.updateAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateAssetOperation).toHaveBeenNthCalledWith(
            1,
            roleProof,
            1,
            'update',
            [1, 2],
            3,
            '38.8951',
            '-77.0364',
            processTypes
        );

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve AssetOperation counter', async () => {
        const response: number = await assetOperationDriver.getAssetOperationsCounter(roleProof);

        expect(response).toEqual(1);

        expect(mockedContract.getAssetOperationsCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getAssetOperationsCounter).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve AssetOperations of creator', async () => {
        const response: AssetOperation[] = await assetOperationDriver.getAssetOperationsOfCreator(
            roleProof,
            companyAddress
        );

        expect(response).toEqual([mockedAssetOperation]);

        expect(mockedContract.getAssetOperationIdsOfCreator).toHaveBeenCalledTimes(1);
        expect(mockedContract.getAssetOperationIdsOfCreator).toHaveBeenNthCalledWith(
            1,
            roleProof,
            companyAddress
        );
    });

    it('should correctly retrieve a AssetOperation', async () => {
        const response: AssetOperation = await assetOperationDriver.getAssetOperation(roleProof, 1);

        expect(response).toEqual(mockedAssetOperation);

        expect(mockedGetAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperation).toHaveBeenNthCalledWith(1, roleProof, 1);
    });

    it('should correctly retrieve all AssetOperations', async () => {
        const response: AssetOperation[] = await assetOperationDriver.getAssetOperations(roleProof);

        expect(response).toEqual([mockedAssetOperation]);

        expect(mockedGetAssetOperationCounter).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperationCounter).toHaveBeenNthCalledWith(1, roleProof);

        expect(mockedGetAssetOperation).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperation).toHaveBeenNthCalledWith(1, roleProof, 1);
    });

    it('should correctly retrieve all AssetOperations by output material', async () => {
        const firstResponse: AssetOperation[] =
            await assetOperationDriver.getAssetOperationsByOutputMaterial(roleProof, 3);
        const secondResponse: AssetOperation[] =
            await assetOperationDriver.getAssetOperationsByOutputMaterial(roleProof, 42);

        expect(firstResponse).toEqual([mockedAssetOperation]);
        expect(secondResponse).toEqual([]);

        expect(mockedGetAssetOperationCounter).toHaveBeenCalledTimes(2);
        expect(mockedGetAssetOperationCounter).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedGetAssetOperationCounter).toHaveBeenNthCalledWith(2, roleProof);

        expect(mockedGetAssetOperation).toHaveBeenCalledTimes(2);
        expect(mockedGetAssetOperation).toHaveBeenNthCalledWith(1, roleProof, 1);
        expect(mockedGetAssetOperation).toHaveBeenNthCalledWith(2, roleProof, 1);
    });

    it('should check if an AssetOperation exists', async () => {
        const response: boolean = await assetOperationDriver.getAssetOperationExists(roleProof, 1);

        expect(response).toEqual(true);

        expect(mockedGetAssetOperationExists).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperationExists).toHaveBeenNthCalledWith(1, roleProof, 1);
    });

    it('should get AssetOperation type - CASE CONSOLIDATION', async () => {
        const response: AssetOperationType = await assetOperationDriver.getAssetOperationType(
            roleProof,
            1
        );

        expect(response).toEqual(AssetOperationType.CONSOLIDATION);

        expect(mockedGetAssetOperationType).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperationType).toHaveBeenNthCalledWith(1, roleProof, 1);
    });

    it('should get AssetOperation type - CASE TRANSFORMATION', async () => {
        mockedGetAssetOperationType.mockReturnValueOnce(1);
        const response: AssetOperationType = await assetOperationDriver.getAssetOperationType(
            roleProof,
            1
        );

        expect(response).toEqual(AssetOperationType.TRANSFORMATION);

        expect(mockedGetAssetOperationType).toHaveBeenCalledTimes(1);
        expect(mockedGetAssetOperationType).toHaveBeenNthCalledWith(1, roleProof, 1);
    });

    it('should get AssetOperation type - CASE ERROR', async () => {
        mockedGetAssetOperationType.mockReturnValueOnce(10);
        await expect(assetOperationDriver.getAssetOperationType(roleProof, 1)).rejects.toThrow(
            'AssetOperationDriver: an invalid value "10" for "AssetOperationType" was returned by the contract'
        );
    });
});
