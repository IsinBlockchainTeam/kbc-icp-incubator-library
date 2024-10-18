import { ActorSubclass, Identity } from '@dfinity/agent';
import { Enumeration } from '@kbc-lib/azle-types/src/models/Enumeration';
import { _SERVICE } from '../../declarations/entity_manager/entity_manager.did';
import { createActor } from '../../declarations/entity_manager';

export class EnumerationManagerDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getEnumerationsByType(enumeration: Enumeration): Promise<string[]> {
        return this._actor.getEnumerationsByType(enumeration);
    }

    async addEnumerationValue(enumeration: Enumeration, value: string): Promise<void> {
        await this._actor.addEnumerationValue(enumeration, value);
    }

    async removeEnumerationValue(enumeration: Enumeration, value: string): Promise<void> {
        await this._actor.removeEnumerationValue(enumeration, value);
    }

    async hasEnumerationValue(enumeration: Enumeration, value: string): Promise<boolean> {
        return this._actor.hasEnumerationValue(enumeration, value);
    }
}
