import { StableBTreeMap } from 'azle';
import { AssetOperation, Material } from '../models/types';
import { StableMemoryId } from '../utils/stableMemory';
import { AssetOperationNotFoundError } from '../models/errors/AssetOperationError';
import AuthenticationService from './AuthenticationService';
import { validateMaterialById, validateProcessTypes } from '../utils/validation';

class AssetOperationService {
    private static _instance: AssetOperationService;

    private _companyAssetOperationIds = StableBTreeMap<string, bigint[]>(StableMemoryId.COMPANY_ASSET_OPERATION_IDS);

    private _assetOperations = StableBTreeMap<bigint, AssetOperation>(StableMemoryId.ASSET_OPERATION);

    static get instance() {
        if (!AssetOperationService._instance) {
            AssetOperationService._instance = new AssetOperationService();
        }
        return AssetOperationService._instance;
    }

    getAllAssetOperations(): AssetOperation[] {
        return this._assetOperations.values();
    }

    getCompanyAssetOperations(company: string): AssetOperation[] {
        const companyAssetOperationIds = this._companyAssetOperationIds.get(company);
        return companyAssetOperationIds ? companyAssetOperationIds.map((id) => this.getAssetOperation(id)) : [];
    }

    getAssetOperation(id: bigint): AssetOperation {
        const result = this._assetOperations.get(id);
        if (!result) throw new AssetOperationNotFoundError();
        return result;
    }

    createAssetOperation(name: string, inputMaterialIds: bigint[], outputMaterialId: bigint, latitude: string, longitude: string, processTypes: string[]): AssetOperation {
        const { inputMaterials, outputMaterial } = this._validateArgs(inputMaterialIds, outputMaterialId, processTypes);
        const loggedCompany = AuthenticationService.instance.getDelegatorAddress();

        const id = BigInt(this._assetOperations.keys().length);
        const assetOperation: AssetOperation = {
            id,
            name,
            inputMaterials,
            outputMaterial,
            latitude,
            longitude,
            processTypes
        };
        this._companyAssetOperationIds.insert(loggedCompany, [...(this._companyAssetOperationIds.get(loggedCompany) || []), id]);
        this._assetOperations.insert(id, assetOperation);
        return assetOperation;
    }

    updateAssetOperation(id: bigint, name: string, inputMaterialIds: bigint[], outputMaterialId: bigint, latitude: string, longitude: string, processTypes: string[]): AssetOperation {
        const { inputMaterials, outputMaterial } = this._validateArgs(inputMaterialIds, outputMaterialId, processTypes);
        const assetOperation = this.getAssetOperation(id);
        if (!assetOperation) throw new AssetOperationNotFoundError();

        assetOperation.name = name;
        assetOperation.inputMaterials = inputMaterials;
        assetOperation.outputMaterial = outputMaterial;
        assetOperation.latitude = latitude;
        assetOperation.longitude = longitude;
        assetOperation.processTypes = processTypes;
        this._assetOperations.insert(id, assetOperation);
        return assetOperation;
    }

    deleteAssetOperation(id: bigint): AssetOperation {
        const assetOperation = this.getAssetOperation(id);
        if (!assetOperation) throw new AssetOperationNotFoundError();
        const loggedCompany = AuthenticationService.instance.getDelegatorAddress();

        this._companyAssetOperationIds.insert(
            loggedCompany,
            (this._companyAssetOperationIds.get(loggedCompany) || []).filter((assetOperationId) => assetOperationId !== id)
        );
        this._assetOperations.remove(id);
        return assetOperation;
    }

    _validateArgs(
        inputMaterialIds: bigint[],
        outputMaterialId: bigint,
        processTypes: string[]
    ): {
        inputMaterials: Material[];
        outputMaterial: Material;
    } {
        const inputMaterials = inputMaterialIds.map((id) => validateMaterialById(id));
        const outputMaterial = validateMaterialById(outputMaterialId);
        validateProcessTypes(processTypes);

        return { inputMaterials, outputMaterial };
    }
}

export default AssetOperationService;
