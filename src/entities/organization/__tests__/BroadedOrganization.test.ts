import { BroadedOrganization } from '../BroadedOrganization';
import { OrganizationVisibilityLevel } from '@kbc-lib/azle-types';
import { mockOrganizations } from '../../../__shared__/constants/mock-data';


describe('BroadedOrganization', () => {
    const ethAddress = '0x1234567890123456789012345678901234567890';
    const mockOrganization = mockOrganizations[0];
    
    let organization: BroadedOrganization;

    beforeEach(() => {
        organization = new BroadedOrganization(
            ethAddress,
            mockOrganization.legalName,
            mockOrganization.industrialSector,
            mockOrganization.address,
            mockOrganization.city,
            mockOrganization.postalCode,
            mockOrganization.region,
            mockOrganization.countryCode,
            mockOrganization.role,
            mockOrganization.telephone,
            mockOrganization.email,
            mockOrganization.image
        );
    });

    it('should get organization properties correctly', () => {
        expect(organization.ethAddress).toBe(ethAddress);
        expect(organization.legalName).toBe(mockOrganization.legalName);
        expect(organization.visibilityLevel).toBe(OrganizationVisibilityLevel.BROAD);
        expect(organization.industrialSector).toBe(mockOrganization.industrialSector);
        expect(organization.address).toBe(mockOrganization.address);
        expect(organization.city).toBe(mockOrganization.city);
        expect(organization.postalCode).toBe(mockOrganization.postalCode);
        expect(organization.region).toBe(mockOrganization.region);
        expect(organization.countryCode).toBe(mockOrganization.countryCode);
        expect(organization.role).toBe(mockOrganization.role);
        expect(organization.telephone).toBe(mockOrganization.telephone);
        expect(organization.email).toBe(mockOrganization.email);
        expect(organization.image).toBe(mockOrganization.image);
    });
});