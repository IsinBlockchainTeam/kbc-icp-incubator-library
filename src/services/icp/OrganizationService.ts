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

    async createOrganization(name: string, description: string) {
        return this._organizationDriver.createOrganization(name, description);
    }

    async updateOrganization(ethAddress: string, name: string, description: string) {
        return this._organizationDriver.updateOrganization(ethAddress, name, description);
    }
}
