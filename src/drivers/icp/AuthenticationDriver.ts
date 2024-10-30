import type {ActorSubclass, Identity} from "@dfinity/agent";
import {RoleProof} from "@kbc-lib/azle-types";
import {_SERVICE} from "icp-declarations/entity_manager/entity_manager.did";
import {createActor} from "icp-declarations/entity_manager";

export class AuthenticationDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async login(roleProof: RoleProof): Promise<boolean> {
        return this._actor.login(roleProof);
    }

    async refresh(): Promise<boolean> {
        return this._actor.refresh();
    }

    async logout(): Promise<boolean> {
        return this._actor.logout();
    }
}
