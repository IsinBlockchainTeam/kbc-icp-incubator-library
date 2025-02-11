import { NarrowedOrganizationCreator } from '../NarrowedOrganizationCreator';
import { Organization } from "../../../models/types/src/Organization";
import { OrganizationPresentation } from '../../../models/types/src/presentations/OrganizationPresentation';

describe('NarrowedOrganizationCreator', () => {
    let narrowedOrganizationCreator: NarrowedOrganizationCreator;
    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockLegalName = 'Mock Organization';

    beforeAll(() => {
        narrowedOrganizationCreator = new NarrowedOrganizationCreator();
    });

    it('should create a narrowed organization presentation from organization', () => {
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
            visibilityLevel: { NARROW: null },
            ethAddress: mockEthAddress,
            legalName: mockLegalName,
            industrialSector: [],
            address: [],
            city: [],
            postalCode: [],
            region: [],
            countryCode: [],
            role: [],
            telephone: [],
            email: [],
            image: []
        };

        const presentation = narrowedOrganizationCreator.fromOrganization(organization);
        expect(presentation).toEqual(expectedPresentation);
    });
});