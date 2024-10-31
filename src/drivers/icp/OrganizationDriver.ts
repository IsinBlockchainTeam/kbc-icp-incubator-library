import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { createActor } from '../../declarations/entity_manager';
import { Organization } from '../../entities/organization/Organization';
import { BroadedOrganizationCreator } from '../../factories/organization/BroadedOrganizationCreator';

export class OrganizationDriver {
    private _actor: ActorSubclass<_SERVICE>;

    public constructor(icpIdentity: Identity, canisterId: string, host?: string) {
        this._actor = createActor(canisterId, {
            agentOptions: {
                identity: icpIdentity,
                ...(host && { host })
            }
        });
    }

    async getOrganizations(): Promise<Organization[]> {
        const organizations = await this._actor.getOrganizations();
        return organizations.map((organization: any) =>
            new BroadedOrganizationCreator().createOrganization(organization)
        );
    }

    async getOrganization(ethAddress: string): Promise<Organization> {
        const organization = await this._actor.getOrganization(ethAddress);

        return new BroadedOrganizationCreator().createOrganization(organization);
    }

    async createOrganization(name: string, description: string): Promise<Organization> {
        const organization = await this._actor.createOrganization(name, description);
        return new BroadedOrganizationCreator().createOrganization(organization);
    }

    async updateOrganization(
        ethAddress: string,
        name: string,
        description: string
    ): Promise<Organization> {
        const organization = await this._actor.updateOrganization(ethAddress, name, description);
        return new BroadedOrganizationCreator().createOrganization(organization);
    }
}
