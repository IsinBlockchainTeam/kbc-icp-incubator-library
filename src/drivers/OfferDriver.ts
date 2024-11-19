import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from 'icp-declarations/entity_manager';
import { Offer } from '../entities/Offer';
import { EntityBuilder } from '../utils/EntityBuilder';
import { HandleIcpError } from '../decorators/HandleIcpError';

export class OfferDriver {
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
    async getOffers(): Promise<Offer[]> {
        const resp = await this._actor.getOffers();
        return resp.map((rawOffer) => EntityBuilder.buildOffer(rawOffer));
    }

    @HandleIcpError()
    async getOffer(id: number): Promise<Offer> {
        const resp = await this._actor.getOffer(BigInt(id));
        return EntityBuilder.buildOffer(resp);
    }

    @HandleIcpError()
    async createOffer(productCategoryId: number): Promise<Offer> {
        const resp = await this._actor.createOffer(BigInt(productCategoryId));
        return EntityBuilder.buildOffer(resp);
    }
}
