import { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { Enumeration } from '../../entities/icp/Enumeration';
import { EntityBuilder } from '../../utils/icp/EntityBuilder';

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
        return this._actor.getEnumerationsByType(EntityBuilder.buildICPEnumeration(enumeration));
    }

    async addEnumerationValue(enumeration: Enumeration, value: string): Promise<void> {
        await this._actor.addEnumerationValue(
            EntityBuilder.buildICPEnumeration(enumeration),
            value
        );
    }

    async removeEnumerationValue(enumeration: Enumeration, value: string): Promise<void> {
        await this._actor.removeEnumerationValue(
            EntityBuilder.buildICPEnumeration(enumeration),
            value
        );
    }

    async hasEnumerationValue(enumeration: Enumeration, value: string): Promise<boolean> {
        return this._actor.hasEnumerationValue(
            EntityBuilder.buildICPEnumeration(enumeration),
            value
        );
    }
}
