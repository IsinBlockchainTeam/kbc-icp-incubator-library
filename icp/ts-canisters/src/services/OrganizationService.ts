import { StableBTreeMap } from 'azle';
import { Organization, OrganizationRoleType } from '../models/types/src/Organization';
import { StableMemoryId } from '../utils/stableMemory';
import { OrganizationPresentation } from '../models/types/src/presentations/OrganizationPresentation';
import AuthenticationService from './AuthenticationService';
import { NarrowedOrganizationCreator } from '../factories/organization/NarrowedOrganizationCreator';
import { BroadedOrganizationCreator } from '../factories/organization/BroadedOrganizationCreator';
import OrderService from './OrderService';
import { OrganizationNotFoundError } from '../models/errors';

class OrganizationService {
    private static _instance: OrganizationService;

    private _organizations = StableBTreeMap<string, Organization>(StableMemoryId.ORGANIZATIONS);

    static get instance() {
        if (!OrganizationService._instance) {
            OrganizationService._instance = new OrganizationService();
        }
        return OrganizationService._instance;
    }

    isOrganizationKnown(ethAddress: string): boolean {
        const authenticatedCompanyEthAddress = AuthenticationService.instance.getDelegatorAddress();

        const orderBetweenParties = OrderService.instance.getOrdersBetweenParties(authenticatedCompanyEthAddress, ethAddress);

        return orderBetweenParties.length > 0 || ethAddress === authenticatedCompanyEthAddress;
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
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }

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
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }

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
        const organization = this._organizations.get(ethAddress);
        if (!organization) {
            throw new OrganizationNotFoundError();
        }

        this._organizations.remove(ethAddress);

        return true;
    }
}

export default OrganizationService;
