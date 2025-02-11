import { StableBTreeMap } from 'azle';
import { Organization, OrganizationRoleType } from '../models/types/src/Organization';
import { StableMemoryId } from '../utils/stableMemory';
import { OrganizationPresentation } from '../models/types/src/presentations/OrganizationPresentation';
import AuthenticationService from './AuthenticationService';
import { NarrowedOrganizationCreator } from '../factories/organization/NarrowedOrganizationCreator';
import { BroadedOrganizationCreator } from '../factories/organization/BroadedOrganizationCreator';
import { OrganizationNotFoundError } from '../models/errors';
import BusinessRelationService from './BusinessRelationService';

class OrganizationService {
    private static _instance: OrganizationService;

    private _organizations = StableBTreeMap<string, Organization>(StableMemoryId.ORGANIZATIONS);

    static get instance() {
        if (!OrganizationService._instance) {
            OrganizationService._instance = new OrganizationService();
        }
        return OrganizationService._instance;
    }

    getRawOrganization(ethAddress: string): Organization {
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }
        return organization;
    }

    isOrganizationKnown(ethAddress: string): boolean {
        const authenticatedCompanyEthAddress = AuthenticationService.instance.getDelegatorAddress();

        if (ethAddress === authenticatedCompanyEthAddress) return true;

        try {
            // The ethAddress allowed the authenticatedCompanyEthAddress to see their information
            BusinessRelationService.instance.getBusinessRelation(ethAddress, authenticatedCompanyEthAddress);

            return  true;
        } catch (error) {
            return false;
        }
    }

    getOrganizationPresentation(organization: Organization): OrganizationPresentation {
        const isOrganizationKnown = this.isOrganizationKnown(organization.ethAddress);

        if (!isOrganizationKnown) {
            return new NarrowedOrganizationCreator().fromOrganization(organization);
        }

        return new BroadedOrganizationCreator().fromOrganization(organization);
    }

    getOrganizations(): OrganizationPresentation[] {
        const organizations = this._organizations.values();

        return organizations.map((organization) => this.getOrganizationPresentation(organization));
    }

    getOrganization(ethAddress: string): OrganizationPresentation {
        const organization = this.getRawOrganization(ethAddress);

        return this.getOrganizationPresentation(organization);
    }

    createOrganization(
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRoleType,
        telephone: string,
        email: string,
        image: string
    ): OrganizationPresentation {
        const authenticatedCompanyEthAddress = AuthenticationService.instance.getDelegatorAddress();

        const organization: Organization = {
            ethAddress: authenticatedCompanyEthAddress,
            legalName,
            industrialSector,
            address,
            city,
            postalCode,
            region,
            countryCode,
            role,
            telephone,
            email,
            image
        };
        console.log('new organization', organization);
        console.log('authenticatedCompanyEthAddress', authenticatedCompanyEthAddress);

        this._organizations.insert(authenticatedCompanyEthAddress, organization);

        return new BroadedOrganizationCreator().fromOrganization(organization);
    }

    updateOrganization(
        ethAddress: string,
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRoleType,
        telephone: string,
        email: string,
        image: string
    ): OrganizationPresentation {
        this.getRawOrganization(ethAddress);

        const updatedOrganization: Organization = {
            ethAddress,
            legalName,
            industrialSector,
            address,
            city,
            postalCode,
            region,
            countryCode,
            role,
            telephone,
            email,
            image
        };

        this._organizations.insert(ethAddress, updatedOrganization);

        return new BroadedOrganizationCreator().fromOrganization(updatedOrganization);
    }

    deleteOrganization(ethAddress: string): boolean {
       this.getRawOrganization(ethAddress);

        this._organizations.remove(ethAddress);

        return true;
    }
}

export default OrganizationService;
