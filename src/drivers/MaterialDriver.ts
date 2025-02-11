import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from '../entities/Material';
import { HandleIcpError } from '../decorators/HandleIcpError';

export class MaterialDriver {
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
    async getMaterials(): Promise<Material[]> {
        const resp = await this._actor.getMaterials();
        return resp.map((rawMaterial) => EntityBuilder.buildMaterial(rawMaterial));
    }

    @HandleIcpError()
    async getMaterial(id: number): Promise<Material> {
        const resp = await this._actor.getMaterial(BigInt(id));
        return EntityBuilder.buildMaterial(resp);
    }

    @HandleIcpError()
    async createMaterial(name: string, productCategoryId: number, typology: string, quality: string, moisture: string, isInput: boolean): Promise<Material> {
        const resp = await this._actor.createMaterial(name, BigInt(productCategoryId), typology, quality, moisture, isInput);
        return EntityBuilder.buildMaterial(resp);
    }

    @HandleIcpError()
    async updateMaterial(id: number, name: string, productCategoryId: number, typology: string, quality: string, moisture: string, isInput: boolean) {
        const resp = await this._actor.updateMaterial(BigInt(id), name, BigInt(productCategoryId), typology, quality, moisture, isInput);
        return EntityBuilder.buildMaterial(resp);
    }
}
