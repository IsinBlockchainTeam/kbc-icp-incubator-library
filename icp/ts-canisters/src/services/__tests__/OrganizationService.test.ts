import { StableBTreeMap } from 'azle';
import OrganizationService from '../OrganizationService';
import AuthenticationService from '../AuthenticationService';
import BusinessRelationService from '../BusinessRelationService';
import { Organization, OrganizationRoleType } from '../../models/types/src/Organization';
import { OrganizationPresentation } from '../../models/types/src/presentations/OrganizationPresentation';
import { NarrowedOrganizationCreator } from '../../factories/organization/NarrowedOrganizationCreator';
import { BroadedOrganizationCreator } from '../../factories/organization/BroadedOrganizationCreator';
import { OrganizationNotFoundError } from '../../models/errors';

jest.mock('azle');
jest.mock('../AuthenticationService', () => ({
    instance: {
        getDelegatorAddress: jest.fn()
    }
}));
jest.mock('../BusinessRelationService', () => ({
    instance: {
        getBusinessRelation: jest.fn()
    }
}));
jest.mock('../../factories/organization/NarrowedOrganizationCreator');
jest.mock('../../factories/organization/BroadedOrganizationCreator');

describe('OrganizationService', () => {
    let organizationService: OrganizationService;
    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockOrganization: Organization = {
        ethAddress: mockEthAddress,
        legalName: 'Mock Organization',
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
    const mockNarrowedPresentation: OrganizationPresentation = {
        visibilityLevel: { NARROW: null },
        ethAddress: mockEthAddress,
        legalName: mockOrganization.legalName,
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
    const mockBroadedPresentation: OrganizationPresentation = {
        visibilityLevel: { BROAD: null },
        ethAddress: mockEthAddress,
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

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        insert: jest.fn(),
        remove: jest.fn()
    };

    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<typeof AuthenticationService.instance>;
    const businessRelationServiceInstanceMock = BusinessRelationService.instance as jest.Mocked<typeof BusinessRelationService.instance>;

    beforeEach(() => {
        jest.spyOn(console, 'log').mockImplementation(jest.fn());
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            insert: mockedFn.insert,
            remove: mockedFn.remove
        });
        (NarrowedOrganizationCreator as jest.Mock).mockImplementation(() => ({
            fromOrganization: jest.fn().mockReturnValue(mockNarrowedPresentation)
        }));
        (BroadedOrganizationCreator as jest.Mock).mockImplementation(() => ({
            fromOrganization: jest.fn().mockReturnValue(mockBroadedPresentation)
        }));
        organizationService = OrganizationService.instance;
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue(mockEthAddress);
    });

    it('should get raw organization data', () => {
        mockedFn.get.mockReturnValue(mockOrganization);
        const result = organizationService.getRawOrganization(mockEthAddress);
        expect(result).toEqual(mockOrganization);
    });

    it('should throw OrganizationNotFoundError when organization does not exist', () => {
        mockedFn.get.mockReturnValue(undefined);
        expect(() => organizationService.getRawOrganization(mockEthAddress)).toThrow(OrganizationNotFoundError);
    });

    it('should get organization with appropriate visibility', () => {
        mockedFn.get.mockReturnValue(mockOrganization);
        authenticationServiceInstanceMock.getDelegatorAddress.mockReturnValue('other');
        businessRelationServiceInstanceMock.getBusinessRelation.mockImplementation(() => { throw new Error(); });

        const result = organizationService.getOrganization(mockEthAddress);
        expect(result).toEqual(mockNarrowedPresentation);
    });

    it('should get all organizations', () => {
        mockedFn.values.mockReturnValue([mockOrganization]);
        const result = organizationService.getOrganizations();
        expect(result).toEqual([mockBroadedPresentation]);
    });

    it('should create an organization', () => {
        const result = organizationService.createOrganization(
            mockOrganization.legalName,
            mockOrganization.industrialSector,
            mockOrganization.address,
            mockOrganization.city,
            mockOrganization.postalCode,
            mockOrganization.region,
            mockOrganization.countryCode,
            mockOrganization.role as OrganizationRoleType,
            mockOrganization.telephone,
            mockOrganization.email,
            mockOrganization.image
        );

        expect(mockedFn.insert).toHaveBeenCalledWith(mockEthAddress, mockOrganization);
        expect(result).toEqual(mockBroadedPresentation);
    });

    it('should update an organization', () => {
        mockedFn.get.mockReturnValue(mockOrganization);
        const result = organizationService.updateOrganization(
            mockEthAddress,
            mockOrganization.legalName,
            mockOrganization.industrialSector,
            mockOrganization.address,
            mockOrganization.city,
            mockOrganization.postalCode,
            mockOrganization.region,
            mockOrganization.countryCode,
            mockOrganization.role as OrganizationRoleType,
            mockOrganization.telephone,
            mockOrganization.email,
            mockOrganization.image
        );

        expect(mockedFn.insert).toHaveBeenCalledWith(mockEthAddress, mockOrganization);
        expect(result).toEqual(mockBroadedPresentation);
    });

    it('should check if organization is known', () => {
        const otherAddress = '0x9876543210987654321098765432109876543210';
        businessRelationServiceInstanceMock.getBusinessRelation.mockReturnValue({} as any);
        const result = organizationService.isOrganizationKnown(otherAddress);
        expect(result).toBe(true);
    });

    it('should get organization presentation with broad visibility', () => {
        businessRelationServiceInstanceMock.getBusinessRelation.mockReturnValue({} as any);
        const result = organizationService.getOrganizationPresentation(mockOrganization);
        expect(result).toEqual(mockBroadedPresentation);
    });

    it('should delete an organization', () => {
        mockedFn.get.mockReturnValue(mockOrganization);
        const result = organizationService.deleteOrganization(mockEthAddress);
        expect(mockedFn.remove).toHaveBeenCalledWith(mockEthAddress);
        expect(result).toBe(true);
    });
});
