import { OrganizationRole } from '@kbc-lib/azle-types';
import { OrganizationDriver } from '../../drivers/icp/OrganizationDriver';

export class OrganizationService {
    private readonly _organizationDriver: OrganizationDriver;

    constructor(organizationDriver: OrganizationDriver) {
        this._organizationDriver = organizationDriver;
    }

    async getOrganizations() {
        return this._organizationDriver.getOrganizations();
    }

    async getOrganization(ethAddress: string) {
        return this._organizationDriver.getOrganization(ethAddress);
    }

    async createOrganization(
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRole,
        telephone: string,
        email: string,
        image: string
    ) {
        return this._organizationDriver.createOrganization(
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
        );
    }

    async updateOrganization(
        ethAddress: string,
        legalName: string,
        industrialSector: string,
        address: string,
        city: string,
        postalCode: string,
        region: string,
        countryCode: string,
        role: OrganizationRole,
        telephone: string,
        email: string,
        image: string
    ) {
        return this._organizationDriver.updateOrganization(
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
        );
    }
}
