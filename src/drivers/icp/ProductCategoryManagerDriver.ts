import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from '../../../icp/ts-canister/.dfx/local/canisters/product_category_manager/service.did';
import { createActor } from '../../declarations/product_category_manager';
import {RoleProof} from "../../../icp/ts-canister/src/models/Proof";

export class ProductCategoryManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        if (!icpIdentity) throw new Error('ICPStorageDriver: No ICP identity found');

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
