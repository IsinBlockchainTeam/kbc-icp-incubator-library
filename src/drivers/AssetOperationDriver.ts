import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { HandleIcpError } from '../decorators/HandleIcpError';
import { AssetOperation } from '../entities/AssetOperation';
import { EntityBuilder } from '../utils/EntityBuilder';

export type AssetOperationParams = {
    name: string;
    inputMaterialIds: number[];
    outputMaterialId: number;
    latitude: string;
    longitude: string;
    processTypes: string[];
};

export class AssetOperationDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    @HandleIcpError()
    async getAllAssetOperations(): Promise<AssetOperation[]> {
        const assetOperations = await this._actor.getAllAssetOperations();
        return assetOperations.map((assetOperation) =>
            EntityBuilder.buildAssetOperation(assetOperation)
        );
    }

    @HandleIcpError()
    async getCompanyAssetOperations(company: string): Promise<AssetOperation[]> {
        const assetOperations = await this._actor.getCompanyAssetOperations(company);
        return assetOperations.map((assetOperation) =>
            EntityBuilder.buildAssetOperation(assetOperation)
        );
    }

    @HandleIcpError()
    async getAssetOperation(id: number): Promise<AssetOperation> {
        const assetOperation = await this._actor.getAssetOperation(BigInt(id));
        return EntityBuilder.buildAssetOperation(assetOperation);
    }

    @HandleIcpError()
    async createAssetOperation(params: AssetOperationParams): Promise<AssetOperation> {
        const assetOperation = await this._actor.createAssetOperation(
            params.name,
            params.inputMaterialIds.map((materialId) => BigInt(materialId)),
            BigInt(params.outputMaterialId),
            params.latitude,
            params.longitude,
            params.processTypes
        );
        return EntityBuilder.buildAssetOperation(assetOperation);
    }

    @HandleIcpError()
    async updateAssetOperation(id: number, params: AssetOperationParams): Promise<AssetOperation> {
        const assetOperation = await this._actor.updateAssetOperation(
            BigInt(id),
            params.name,
            params.inputMaterialIds.map((materialId) => BigInt(materialId)),
            BigInt(params.outputMaterialId),
            params.latitude,
            params.longitude,
            params.processTypes
        );
        return EntityBuilder.buildAssetOperation(assetOperation);
    }

    @HandleIcpError()
    async deleteAssetOperation(id: number): Promise<AssetOperation> {
        const assetOperation = await this._actor.deleteAssetOperation(BigInt(id));
        return EntityBuilder.buildAssetOperation(assetOperation);
    }
}
