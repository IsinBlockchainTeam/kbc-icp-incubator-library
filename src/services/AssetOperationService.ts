import { AssetOperation } from '../entities/AssetOperation';
import { AssetOperationDriver } from '../drivers/AssetOperationDriver';
import { AssetOperationType } from '../types/AssetOperationType';

export class AssetOperationService {
    private _assetOperationDriver: AssetOperationDriver;

    constructor(assetOperationDriver: AssetOperationDriver) {
        this._assetOperationDriver = assetOperationDriver;
    }

    async getAssetOperationsCounter(): Promise<number> {
        return this._assetOperationDriver.getAssetOperationsCounter();
    }

    async getAssetOperationExists(id: number): Promise<boolean> {
        return this._assetOperationDriver.getAssetOperationExists(id);
    }

    async getAssetOperation(id: number): Promise<AssetOperation> {
        return this._assetOperationDriver.getAssetOperation(id);
    }

    async getAssetOperations(): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAssetOperations();
    }

    async getAssetOperationType(id: number): Promise<AssetOperationType> {
        return this._assetOperationDriver.getAssetOperationType(id);
    }

    async getAssetOperationsOfCreator(creator: string): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAssetOperationsOfCreator(creator);
    }

    async getAssetOperationsByOutputMaterial(materialId: number): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAssetOperationsByOutputMaterial(materialId);
    }

    async registerAssetOperation(
        name: string,
        inputMaterialsIds: number[],
        outputMaterialId: number,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ): Promise<number> {
        return this._assetOperationDriver.registerAssetOperation(
            name,
            inputMaterialsIds,
            outputMaterialId,
            latitude,
            longitude,
            processTypes
        );
    }

    async updateAssetOperation(
        id: number,
        name: string,
        inputMaterialsIds: number[],
        outputMaterialId: number,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ): Promise<void> {
        return this._assetOperationDriver.updateAssetOperation(
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
