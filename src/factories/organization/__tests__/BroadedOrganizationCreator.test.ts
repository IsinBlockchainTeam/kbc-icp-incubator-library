import { BroadedOrganizationCreator } from '../BroadedOrganizationCreator';
import { BroadedOrganization } from '../../../entities/organization/BroadedOrganization';
import { mockOrganizations } from '../../../__shared__/constants/mock-data';
import { OrganizationRoleFactory } from '../OrganizationRoleFactory';

jest.mock('../OrganizationRoleFactory');

describe('BroadedOrganizationCreator', () => {
    let broadedOrganizationCreator: BroadedOrganizationCreator;
    const mockOrganization = mockOrganizations[0];

    beforeAll(() => {
        broadedOrganizationCreator = new BroadedOrganizationCreator();
        (OrganizationRoleFactory.prototype.fromICPType as jest.Mock).mockReturnValue(mockOrganization.role);
    });

    it('should create a broaded organization from blockchain data', () => {
        const blockchainOrganization = {
            ethAddress: '0x1234567890123456789012345678901234567890',
            legalName: mockOrganization.legalName,
            industrialSector: [mockOrganization.industrialSector],
            address: [mockOrganization.address],
            city: [mockOrganization.city],
            postalCode: [mockOrganization.postalCode],
            region: [mockOrganization.region],
            countryCode: [mockOrganization.countryCode],
            role: [mockOrganization.role],
            telephone: [mockOrganization.telephone],
            email: [mockOrganization.email],
            image: [mockOrganization.image]
        };

        const organization = broadedOrganizationCreator.createOrganization(blockchainOrganization) as BroadedOrganization;

        expect(organization).toBeInstanceOf(BroadedOrganization);
        expect(organization.ethAddress).toBe(blockchainOrganization.ethAddress);
        expect(organization.legalName).toBe(blockchainOrganization.legalName);
        expect(organization.industrialSector).toBe(blockchainOrganization.industrialSector[0]);
        expect(organization.address).toBe(blockchainOrganization.address[0]);
        expect(organization.city).toBe(blockchainOrganization.city[0]);
        expect(organization.postalCode).toBe(blockchainOrganization.postalCode[0]);
        expect(organization.region).toBe(blockchainOrganization.region[0]);
        expect(organization.countryCode).toBe(blockchainOrganization.countryCode[0]);
        expect(organization.role).toBe(blockchainOrganization.role[0]);
        expect(organization.telephone).toBe(blockchainOrganization.telephone[0]);
        expect(organization.email).toBe(blockchainOrganization.email[0]);
        expect(organization.image).toBe(blockchainOrganization.image[0]);
    });
});