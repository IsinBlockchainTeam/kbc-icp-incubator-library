import { BroadedOrganizationCreator } from '../BroadedOrganizationCreator';
import { Organization } from "../../../models/types/src/Organization";
import { OrganizationPresentation } from '../../../models/types/src/presentations/OrganizationPresentation';

describe('BroadedOrganizationCreator', () => {
    let broadedOrganizationCreator: BroadedOrganizationCreator;
    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockLegalName = 'Mock Organization';

    beforeAll(() => {
        broadedOrganizationCreator = new BroadedOrganizationCreator();
    });

    it('should create a broaded organization presentation from organization', () => {
        const organization: Organization = {
            ethAddress: mockEthAddress,
            legalName: mockLegalName,
            industrialSector: 'Mock Industry',
            address: 'Mock Address',
            city: 'Mock City',
            postalCode: 'Mock Postal Code',
            region: 'Mock Region',
            countryCode: 'Mock Country Code',
            role: { IMPORTER: null },
            telephone: 'Mock Telephone',
            email: 'Mock Email',
            image: 'Mock Image'
        };

        const expectedPresentation: OrganizationPresentation = {
            visibilityLevel: { BROAD: null },
            ethAddress: mockEthAddress,
            legalName: mockLegalName,
            industrialSector: ['Mock Industry'],
            address: ['Mock Address'],
            city: ['Mock City'],
            postalCode: ['Mock Postal Code'],
            region: ['Mock Region'],
            countryCode: ['Mock Country Code'],
            role: [{ IMPORTER: null }],
            telephone: ['Mock Telephone'],
            email: ['Mock Email'],
            image: ['Mock Image']
        };

        const presentation = broadedOrganizationCreator.fromOrganization(organization);
        expect(presentation).toEqual(expectedPresentation);
    });
});