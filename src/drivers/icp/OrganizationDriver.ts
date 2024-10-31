import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { OrganizationVisibilityLevel } from '@kbc-lib/azle-types/src/models/presentations/OrganizationPresentation';
import { createActor } from '../../declarations/entity_manager';
import { Organization } from '../../entities/organization/Organization';
import { BroadedOrganizationCreator } from '../../factories/organization/BroadedOrganizationCreator';
import { OrganizationVisibilityLevelFactory } from '../../factories/organization/OrganizationVisibilityLevelFactory';
import { NarrowedOrganizationCreator } from '../../factories/organization/NarrowedOrganizationCreator';

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

    castOrganization(organization: any): Organization {
        const visibilityLevel = OrganizationVisibilityLevelFactory.fromICPEnum(
            organization.visibilityLevel
        );

        switch (visibilityLevel) {
            case OrganizationVisibilityLevel.BROAD:
                return new BroadedOrganizationCreator().createOrganization(organization);
            case OrganizationVisibilityLevel.NARROW:
                return new NarrowedOrganizationCreator().createOrganization(organization);
            default:
                throw new Error(`Invalid organization visibility level: ${visibilityLevel}`);
        }
    }

    async getOrganizations(): Promise<Organization[]> {
        const organizations = await this._actor.getOrganizations();
        return organizations.map((organization: any) => this.castOrganization(organization));
    }

    async getOrganization(ethAddress: string): Promise<Organization> {
        const organization = await this._actor.getOrganization(ethAddress);

        return this.castOrganization(organization);
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

    async deleteOrganization(ethAddress: string): Promise<boolean> {
        return this._actor.deleteOrganization(ethAddress);
    }
}
