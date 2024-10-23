import type { ActorSubclass, Identity } from '@dfinity/agent';
import {RoleProof} from "@kbc-lib/azle-types";
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

    async getMaterials(roleProof: RoleProof): Promise<Material[]> {
        const resp = await this._actor.getMaterials(roleProof);
        return resp.map(rawMaterial => EntityBuilder.buildMaterial(rawMaterial));
    }

    async getMaterial(roleProof: RoleProof, id: number): Promise<Material> {
        const resp = await this._actor.getMaterial(roleProof, BigInt(id));
        return EntityBuilder.buildMaterial(resp);
    }

    async createMaterial(roleProof: RoleProof, productCategoryId: number): Promise<Material> {
        const resp = await this._actor.createMaterial(roleProof, BigInt(productCategoryId));
        return EntityBuilder.buildMaterial(resp);
    }

    async updateMaterial(roleProof: RoleProof, id: number, productCategoryId: number) {
        const resp = await this._actor.updateMaterial(roleProof, BigInt(id), BigInt(productCategoryId));
        return EntityBuilder.buildMaterial(resp);
    }
}
