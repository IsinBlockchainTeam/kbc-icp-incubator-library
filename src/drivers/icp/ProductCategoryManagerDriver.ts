import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../declarations/entity_manager/entity_manager.did';
import { createActor } from '../../declarations/entity_manager';
import {RoleProof} from "../../../icp/ts-canister/src/models/Proof";

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
