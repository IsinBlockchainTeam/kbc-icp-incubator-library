import type { ActorSubclass, Identity } from '@dfinity/agent';
import {RoleProof} from "@kbc-lib/azle-types";
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import {EntityBuilder} from "../../utils/icp/EntityBuilder";
import {ProductCategory} from "../../entities/ProductCategory";

export class ProductCategoryDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getProductCategories(roleProof: RoleProof): Promise<ProductCategory[]> {
        const resp = await this._actor.getProductCategories(roleProof);
        return resp.map(rawProductCategory => EntityBuilder.buildProductCategory(rawProductCategory));
    }

    async getProductCategory(roleProof: RoleProof, id: number): Promise<ProductCategory> {
        const resp = await this._actor.getProductCategory(roleProof, BigInt(id));
        return EntityBuilder.buildProductCategory(resp);
    }

    async createProductCategory(roleProof: RoleProof, name: string, quality: number, description: string) {
        const resp = await this._actor.createProductCategory(roleProof, name, BigInt(quality), description);
        return EntityBuilder.buildProductCategory(resp);
    }

    async updateProductCategory(roleProof: RoleProof, id: number, name: string, quality: number, description: string) {
        const resp = await this._actor.updateProductCategory(roleProof, BigInt(id), name, BigInt(quality), description);
        return EntityBuilder.buildProductCategory(resp);
    }
}
