import { IDL, query, update } from 'azle';
import { IDLAssetOperation } from '../models/idls/AssetOperation';
import { AssetOperation } from '../models/types';
import AssetOperationService from '../services/AssetOperationService';
import { AtLeastEditor, AtLeastViewer } from '../decorators/roles';

class AssetOperationController {
    @query([], IDL.Vec(IDLAssetOperation))
    @AtLeastViewer
    async getAllAssetOperations(): Promise<AssetOperation[]> {
        return AssetOperationService.instance.getAllAssetOperations();
    }

    @query([IDL.Text], IDL.Vec(IDLAssetOperation))
    @AtLeastViewer
    async getCompanyAssetOperations(company: string): Promise<AssetOperation[]> {
        return AssetOperationService.instance.getCompanyAssetOperations(company);
    }

    @query([IDL.Nat], IDLAssetOperation)
    @AtLeastViewer
    async getAssetOperation(id: bigint): Promise<AssetOperation> {
        return AssetOperationService.instance.getAssetOperation(id);
    }

    @update([IDL.Text, IDL.Vec(IDL.Nat), IDL.Nat, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)], IDLAssetOperation)
    @AtLeastEditor
    async createAssetOperation(name: string, inputMaterialIds: bigint[], outputMaterialId: bigint, latitude: string, longitude: string, processTypes: string[]): Promise<AssetOperation> {
        return AssetOperationService.instance.createAssetOperation(name, inputMaterialIds, outputMaterialId, latitude, longitude, processTypes);
    }

    @update([IDL.Nat, IDL.Text, IDL.Vec(IDL.Nat), IDL.Nat, IDL.Text, IDL.Text, IDL.Vec(IDL.Text)], IDLAssetOperation)
    @AtLeastEditor
    async updateAssetOperation(id: bigint, name: string, inputMaterialIds: bigint[], outputMaterialId: bigint, latitude: string, longitude: string, processTypes: string[]): Promise<AssetOperation> {
        return AssetOperationService.instance.updateAssetOperation(id, name, inputMaterialIds, outputMaterialId, latitude, longitude, processTypes);
    }

    @update([IDL.Nat], IDLAssetOperation)
    @AtLeastEditor
    async deleteAssetOperation(id: bigint): Promise<AssetOperation> {
        return AssetOperationService.instance.deleteAssetOperation(id);
    }
}

export default AssetOperationController;
