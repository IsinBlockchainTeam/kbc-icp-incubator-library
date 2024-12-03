import type { ActorSubclass, Identity } from '@dfinity/agent';
import { RoleProof } from '../types/RoleProof';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { HandleIcpError } from '../decorators/HandleIcpError';
import { EntityBuilder } from '../utils/EntityBuilder';

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
        return this._actor.authenticate(EntityBuilder.buildICPRoleProof(roleProof));
    }

    async logout(): Promise<void> {
        return this._actor.logout();
    }
}
