import type { ActorSubclass, Identity } from '@dfinity/agent';
import { _SERVICE } from 'icp-declarations/entity_manager/entity_manager.did';
import { OrganizationRole, OrganizationVisibilityLevel } from '@kbc-lib/azle-types';
import { createActor } from 'icp-declarations/entity_manager';
import { Organization } from '../../entities/organization/Organization';
import { BroadedOrganizationCreator } from '../../factories/organization/BroadedOrganizationCreator';
import { OrganizationVisibilityLevelFactory } from '../../factories/organization/OrganizationVisibilityLevelFactory';
import { NarrowedOrganizationCreator } from '../../factories/organization/NarrowedOrganizationCreator';
import { OrganizationRoleFactory } from '../../factories/organization/OrganizationRoleFactory';

export type OrganizationParams = {
    legalName: string;
    industrialSector: string;
    address: string;
    city: string;
    postalCode: string;
    region: string;
    countryCode: string;
    role: OrganizationRole;
    telephone: string;
    email: string;
    image: string;
};

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
        const visibilityLevel = new OrganizationVisibilityLevelFactory().fromICPType(
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

    async createOrganization(params: OrganizationParams): Promise<Organization> {
        const icpRole = new OrganizationRoleFactory().toICPType(params.role);

        const organization = await this._actor.createOrganization(
            params.legalName,
            params.industrialSector,
            params.address,
            params.city,
            params.postalCode,
            params.region,
            params.countryCode,
            icpRole,
            params.telephone,
            params.email,
            params.image
        );
        return new BroadedOrganizationCreator().createOrganization(organization);
    }

    async updateOrganization(
        ethAddress: string,
        params: OrganizationParams
    ): Promise<Organization> {
        const icpRole = new OrganizationRoleFactory().toICPType(params.role);

        const organization = await this._actor.updateOrganization(
            ethAddress,
            params.legalName,
            params.industrialSector,
            params.address,
            params.city,
            params.postalCode,
            params.region,
            params.countryCode,
            icpRole,
            params.telephone,
            params.email,
            params.image
        );
        return new BroadedOrganizationCreator().createOrganization(organization);
    }

    async deleteOrganization(ethAddress: string): Promise<boolean> {
        return this._actor.deleteOrganization(ethAddress);
    }
}
