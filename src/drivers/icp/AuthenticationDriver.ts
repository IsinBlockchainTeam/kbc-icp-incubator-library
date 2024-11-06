import type {ActorSubclass, Identity} from "@dfinity/agent";
import {RoleProof} from "@kbc-lib/azle-types";
import {_SERVICE} from "icp-declarations/entity_manager/entity_manager.did";
import {createActor} from "icp-declarations/entity_manager";
import { HandleIcpError } from "../../decorators/HandleIcpError";

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

    @HandleIcpError()
    async authenticate(roleProof: RoleProof): Promise<void> {
        return this._actor.authenticate(roleProof);
    }

    @HandleIcpError()
    async logout(): Promise<void> {
        await this._actor.logout();
    }
}
