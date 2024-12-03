import { Organization } from '../../entities/organization/Organization';

export abstract class OrganizationCreator {
    public abstract createOrganization(blockchainOrganization: any): Organization;
}
