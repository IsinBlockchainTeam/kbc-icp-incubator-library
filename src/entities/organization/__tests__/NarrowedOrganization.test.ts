import { NarrowedOrganization } from '../NarrowedOrganization';
import { OrganizationVisibilityLevel } from '@kbc-lib/azle-types';
import { mockOrganizations } from '../../../__shared__/constants/mock-data';

describe('NarrowedOrganization', () => {
    const ethAddress = '0x1234567890123456789012345678901234567890';
    const legalName = mockOrganizations[0].legalName;
    let organization: NarrowedOrganization;

    beforeEach(() => {
        organization = new NarrowedOrganization(ethAddress, legalName);
    });

    it('should get organization properties correctly', () => {
        expect(organization.ethAddress).toBe(ethAddress);
        expect(organization.legalName).toBe(legalName);
        expect(organization.visibilityLevel).toBe(OrganizationVisibilityLevel.NARROW);
    });
});