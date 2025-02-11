import { NarrowedOrganizationCreator } from '../NarrowedOrganizationCreator';
import { NarrowedOrganization } from '../../../entities/organization/NarrowedOrganization';
import { mockOrganizations } from '../../../__shared__/constants/mock-data';

describe('NarrowedOrganizationCreator', () => {
    let narrowedOrganizationCreator: NarrowedOrganizationCreator;
    const mockOrganization = mockOrganizations[0];

    beforeAll(() => {
        narrowedOrganizationCreator = new NarrowedOrganizationCreator();
    });

    it('should create a narrowed organization from blockchain data', () => {
        const blockchainOrganization = {
            ethAddress: '0x1234567890123456789012345678901234567890',
            legalName: mockOrganization.legalName
        };

        const organization = narrowedOrganizationCreator.createOrganization(blockchainOrganization);

        expect(organization).toBeInstanceOf(NarrowedOrganization);
        expect(organization.ethAddress).toBe(blockchainOrganization.ethAddress);
        expect(organization.legalName).toBe(blockchainOrganization.legalName);
    });
});