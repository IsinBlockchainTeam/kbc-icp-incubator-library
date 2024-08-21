import { AssetOperation } from '../entities/AssetOperation';
import { AssetOperationDriver } from '../drivers/AssetOperationDriver';
import { AssetOperationType } from '../types/AssetOperationType';
import { RoleProof } from '../types/RoleProof';

export class AssetOperationService {
    private _assetOperationDriver: AssetOperationDriver;

    constructor(assetOperationDriver: AssetOperationDriver) {
        this._assetOperationDriver = assetOperationDriver;
    }

    async getAssetOperationsCounter(roleProof: RoleProof): Promise<number> {
        return this._assetOperationDriver.getAssetOperationsCounter(roleProof);
    }

    async getAssetOperationExists(roleProof: RoleProof, id: number): Promise<boolean> {
        return this._assetOperationDriver.getAssetOperationExists(roleProof, id);
    }

    async getAssetOperation(roleProof: RoleProof, id: number): Promise<AssetOperation> {
        return this._assetOperationDriver.getAssetOperation(roleProof, id);
    }

    async getAssetOperations(roleProof: RoleProof): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAssetOperations(roleProof);
    }

    async getAssetOperationType(roleProof: RoleProof, id: number): Promise<AssetOperationType> {
        return this._assetOperationDriver.getAssetOperationType(roleProof, id);
    }

    async getAssetOperationsOfCreator(
        roleProof: RoleProof,
        creator: string
    ): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAssetOperationsOfCreator(roleProof, creator);
    }

    async getAssetOperationsByOutputMaterial(
        roleProof: RoleProof,
        materialId: number
    ): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAssetOperationsByOutputMaterial(roleProof, materialId);
    }

    async registerAssetOperation(
        roleProof: RoleProof,
        name: string,
        inputMaterialsIds: number[],
        outputMaterialId: number,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ): Promise<number> {
        return this._assetOperationDriver.registerAssetOperation(
            roleProof,
            name,
            inputMaterialsIds,
            outputMaterialId,
            latitude,
            longitude,
            processTypes
        );
    }

    async updateAssetOperation(
        roleProof: RoleProof,
        id: number,
        name: string,
        inputMaterialsIds: number[],
        outputMaterialId: number,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ): Promise<void> {
        return this._assetOperationDriver.updateAssetOperation(
            roleProof,
            id,
            name,
            inputMaterialsIds,
            outputMaterialId,
            latitude,
            longitude,
            processTypes
        );
    }
}
