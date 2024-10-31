import { OrganizationCreator } from './OrganizationCreator';
import { Organization } from '../../entities/organization/Organization';
import { NarrowedOrganization } from '../../entities/organization/NarrowedOrganization';

export class NarrowedOrganizationCreator extends OrganizationCreator {
    createOrganization(blockchainOrganization: any): Organization {
        return new NarrowedOrganization(
            blockchainOrganization.ethAddress,
            blockchainOrganization.name
        );
    }
}
