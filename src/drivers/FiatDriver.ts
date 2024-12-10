import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';

export class FiatDriver {
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
        return this._actor.getAllFiats();
    }

    async addValue(value: string, industrialSector?: string): Promise<string> {
        return this._actor.addFiat(value, industrialSector || '');
    }

    async removeValue(value: string, industrialSector?: string): Promise<string> {
        return this._actor.removeFiat(value, industrialSector || '');
    }

    async hasValue(value: string): Promise<boolean> {
        return this._actor.hasFiat(value);
    }
}
