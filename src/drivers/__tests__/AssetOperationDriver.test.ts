import { createActor } from 'icp-declarations/entity_manager';
import { AssetOperation as ICPAssetOperation } from '@kbc-lib/azle-types';
import { Identity } from '@dfinity/agent';
import { AssetOperationDriver } from '../AssetOperationDriver';
import { AssetOperation } from '../../entities/AssetOperation';
import { EntityBuilder } from '../../utils/EntityBuilder';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('AssetOperationDriver', () => {
    let assetOperationDriver: AssetOperationDriver;
    const mockedActor = {
        getAllAssetOperations: jest.fn(),
        getCompanyAssetOperations: jest.fn(),
        getAssetOperation: jest.fn(),
        createAssetOperation: jest.fn(),
        updateAssetOperation: jest.fn(),
        deleteAssetOperation: jest.fn()
    };
    const icpAssetOperation = { id: BigInt(1) } as ICPAssetOperation;
    const assetOperation = { id: 1 } as AssetOperation;

    beforeAll(() => {
        (createActor as jest.Mock).mockReturnValue(mockedActor);
        const icpIdentity = {} as Identity;
        assetOperationDriver = new AssetOperationDriver(icpIdentity, 'canisterId');

        jest.spyOn(EntityBuilder, 'buildAssetOperation').mockReturnValue(assetOperation);
    });

    it('should retrieve all asset operations', async () => {
        mockedActor.getAllAssetOperations.mockResolvedValue([icpAssetOperation, icpAssetOperation]);
        const result = await assetOperationDriver.getAllAssetOperations();

        expect(result).toEqual([assetOperation, assetOperation]);
        expect(mockedActor.getAllAssetOperations).toHaveBeenCalled();
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledTimes(2);
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledWith(icpAssetOperation);
    });

    it('should retrieve company asset operations', async () => {
        mockedActor.getCompanyAssetOperations.mockResolvedValue([
            icpAssetOperation,
            icpAssetOperation
        ]);
        const result = await assetOperationDriver.getCompanyAssetOperations('company');

        expect(result).toEqual([assetOperation, assetOperation]);
        expect(mockedActor.getCompanyAssetOperations).toHaveBeenCalled();
        expect(mockedActor.getCompanyAssetOperations).toHaveBeenCalledWith('company');
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledTimes(2);
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledWith(icpAssetOperation);
    });

    it('should retrieve asset operation', async () => {
        mockedActor.getAssetOperation.mockResolvedValue(icpAssetOperation);
        const result = await assetOperationDriver.getAssetOperation(1);

        expect(result).toEqual(assetOperation);
        expect(mockedActor.getAssetOperation).toHaveBeenCalled();
        expect(mockedActor.getAssetOperation).toHaveBeenCalledWith(BigInt(1));
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledWith(icpAssetOperation);
    });

    it('should create asset operation', async () => {
        mockedActor.createAssetOperation.mockResolvedValue(icpAssetOperation);
        const result = await assetOperationDriver.createAssetOperation({
            name: 'name',
            inputMaterialIds: [1],
            outputMaterialId: 1,
            latitude: 'latitude',
            longitude: 'longitude',
            processTypes: ['processType1']
        });

        expect(result).toEqual(assetOperation);
        expect(mockedActor.createAssetOperation).toHaveBeenCalled();
        expect(mockedActor.createAssetOperation).toHaveBeenCalledWith(
            'name',
            [BigInt(1)],
            BigInt(1),
            'latitude',
            'longitude',
            ['processType1']
        );
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledWith(icpAssetOperation);
    });

    it('should update asset operation', async () => {
        mockedActor.updateAssetOperation.mockResolvedValue(icpAssetOperation);
        const result = await assetOperationDriver.updateAssetOperation(1, {
            name: 'name',
            inputMaterialIds: [1],
            outputMaterialId: 1,
            latitude: 'latitude',
            longitude: 'longitude',
            processTypes: ['processType1']
        });

        expect(result).toEqual(assetOperation);
        expect(mockedActor.updateAssetOperation).toHaveBeenCalled();
        expect(mockedActor.updateAssetOperation).toHaveBeenCalledWith(
            BigInt(1),
            'name',
            [BigInt(1)],
            BigInt(1),
            'latitude',
            'longitude',
            ['processType1']
        );
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledWith(icpAssetOperation);
    });

    it('should delete asset operation', async () => {
        mockedActor.deleteAssetOperation.mockResolvedValue(icpAssetOperation);
        const result = await assetOperationDriver.deleteAssetOperation(1);

        expect(result).toEqual(assetOperation);
        expect(mockedActor.deleteAssetOperation).toHaveBeenCalled();
        expect(mockedActor.deleteAssetOperation).toHaveBeenCalledWith(BigInt(1));
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledTimes(1);
        expect(EntityBuilder.buildAssetOperation).toHaveBeenCalledWith(icpAssetOperation);
    });
});
