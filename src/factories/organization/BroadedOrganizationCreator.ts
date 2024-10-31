import { OrganizationCreator } from './OrganizationCreator';
import { Organization } from '../../entities/organization/Organization';
import { BroadedOrganization } from '../../entities/organization/BroadedOrganization';

export class BroadedOrganizationCreator extends OrganizationCreator {
    createOrganization(blockchainOrganization: any): Organization {
        return new BroadedOrganization(
            Number(blockchainOrganization.id),
            blockchainOrganization.name,
            blockchainOrganization.description[0]
        );
    }
}
