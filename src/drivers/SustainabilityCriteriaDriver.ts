import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { HandleIcpError } from '../decorators/HandleIcpError';

export class SustainabilityCriteriaDriver {
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
    async getAllValues(): Promise<string[]> {
        return this._actor.getAllSustainabilityCriteria();
    }

    @HandleIcpError()
    async addValue(value: string, industrialSector?: string): Promise<string> {
        return this._actor.addSustainabilityCriteria(value, industrialSector || '');
    }

    @HandleIcpError()
    async removeValue(value: string, industrialSector?: string): Promise<string> {
        return this._actor.removeSustainabilityCriteria(value, industrialSector || '');
    }

    @HandleIcpError()
    async hasValue(value: string): Promise<boolean> {
        return this._actor.hasSustainabilityCriteria(value);
    }
}
