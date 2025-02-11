import { AssetOperationDriver, AssetOperationParams } from '../drivers/AssetOperationDriver';
import { AssetOperation } from '../entities/AssetOperation';

export class AssetOperationService {
    private _assetOperationDriver: AssetOperationDriver;

    constructor(assetOperationDriver: AssetOperationDriver) {
        this._assetOperationDriver = assetOperationDriver;
    }

    async getAllAssetOperations(): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getAllAssetOperations();
    }

    async getCompanyAssetOperations(company: string): Promise<AssetOperation[]> {
        return this._assetOperationDriver.getCompanyAssetOperations(company);
    }

    async getAssetOperation(id: number): Promise<AssetOperation> {
        return this._assetOperationDriver.getAssetOperation(id);
    }

    async createAssetOperation(params: AssetOperationParams): Promise<AssetOperation> {
        return this._assetOperationDriver.createAssetOperation(params);
    }

    async updateAssetOperation(id: number, params: AssetOperationParams): Promise<AssetOperation> {
        return this._assetOperationDriver.updateAssetOperation(id, params);
    }

    async deleteAssetOperation(id: number): Promise<AssetOperation> {
        return this._assetOperationDriver.deleteAssetOperation(id);
    }
}
