import { OrganizationDriver, OrganizationParams } from '../drivers/OrganizationDriver';

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

    async createOrganization(params: OrganizationParams) {
        return this._organizationDriver.createOrganization(params);
    }

    async updateOrganization(ethAddress: string, params: OrganizationParams) {
        return this._organizationDriver.updateOrganization(ethAddress, params);
    }
}
