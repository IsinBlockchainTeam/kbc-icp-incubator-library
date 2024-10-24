import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import {EntityBuilder} from "../../utils/icp/EntityBuilder";
import {Material} from "../../entities/Material";

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

    async getMaterials(): Promise<Material[]> {
        const resp = await this._actor.getMaterials();
        return resp.map(rawMaterial => EntityBuilder.buildMaterial(rawMaterial));
    }

    async getMaterial(id: number): Promise<Material> {
        const resp = await this._actor.getMaterial(BigInt(id));
        return EntityBuilder.buildMaterial(resp);
    }

    async createMaterial(productCategoryId: number): Promise<Material> {
        const resp = await this._actor.createMaterial(BigInt(productCategoryId));
        return EntityBuilder.buildMaterial(resp);
    }

    async updateMaterial(id: number, productCategoryId: number) {
        const resp = await this._actor.updateMaterial(BigInt(id), BigInt(productCategoryId));
        return EntityBuilder.buildMaterial(resp);
    }
}
