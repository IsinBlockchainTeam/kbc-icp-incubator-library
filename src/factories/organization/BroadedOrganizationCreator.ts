import { OrganizationCreator } from './OrganizationCreator';
import { Organization } from '../../entities/organization/Organization';
import { BroadedOrganization } from '../../entities/organization/BroadedOrganization';
import { OrganizationRoleFactory } from './OrganizationRoleFactory';

export class BroadedOrganizationCreator extends OrganizationCreator {
    createOrganization(blockchainOrganization: any): Organization {
        const role = new OrganizationRoleFactory().fromICPType(blockchainOrganization.role[0]);

        return new BroadedOrganization(
            blockchainOrganization.ethAddress,
            blockchainOrganization.legalName,
            blockchainOrganization.industrialSector[0],
            blockchainOrganization.address[0],
            blockchainOrganization.city[0],
            blockchainOrganization.postalCode[0],
            blockchainOrganization.region[0],
            blockchainOrganization.countryCode[0],
            role,
            blockchainOrganization.telephone[0],
            blockchainOrganization.email[0],
            blockchainOrganization.image[0]
        );
    }
}
