import type { ActorSubclass, Identity } from '@dfinity/agent';
import {RoleProof} from "@kbc-lib/azle-types";
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';

export class ProductCategoryManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async createProductCategory(name: string, quality: number, description: string) {
        return this._actor.registerProductCategory(name, BigInt(quality), description);
    }

    async getProductCategories() {
        return this._actor.getProductCategories();
    }

    async whoAmI(roleProof: RoleProof) {
        return this._actor.whoAmI(roleProof);
    }

    async verifyMessage(message: string, signature: string) {
        return this._actor.verifyMessage(message, signature);
    }
}
