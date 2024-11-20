import { OrganizationVisibilityLevel } from '@isinblockchainteam/azle-types';
import { Organization } from './Organization';

export class NarrowedOrganization extends Organization {
    // eslint-disable-next-line no-useless-constructor
    constructor(ethAddress: string, legalName: string) {
        super(ethAddress, OrganizationVisibilityLevel.NARROW, legalName);
    }
}
