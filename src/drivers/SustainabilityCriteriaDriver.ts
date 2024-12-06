import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';

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

    async getAllValues(): Promise<string[]> {
        return this._actor.getAllSustainabilityCriteria();
    }

    async addValue(value: string): Promise<string> {
        return this._actor.addSustainabilityCriteria(value);
    }

    async removeValue(value: string): Promise<string> {
        return this._actor.removeSustainabilityCriteria(value);
    }

    async hasValue(value: string): Promise<boolean> {
        return this._actor.hasSustainabilityCriteria(value);
    }
}
