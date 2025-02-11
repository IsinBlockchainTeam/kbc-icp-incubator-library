import { query, update } from 'azle';
import OrganizationController from '../OrganizationController';
import OrganizationService from '../../services/OrganizationService';
import { OrganizationPresentation } from '../../models/types/src/presentations/OrganizationPresentation';
import { OrganizationRoleType, OrganizationRole } from '../../models/types';
import EmailService from "../../services/EmailService";

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/OrganizationService', () => ({
    instance: {
        getOrganizations: jest.fn(),
        getOrganization: jest.fn(),
        createOrganization: jest.fn(),
        updateOrganization: jest.fn()
    }
}));
jest.mock('../../services/EmailService', () => ({
    instance: {
        inviteOrganization: jest.fn(),
        sendOrganizationCredential: jest.fn()
    }
}));

describe('OrganizationController', () => {
    const organizationServiceInstanceMock = OrganizationService.instance as jest.Mocked<typeof OrganizationService.instance>;
    const emailServiceInstanceMock = EmailService.instance as jest.Mocked<typeof EmailService.instance>;
    const organizationController = new OrganizationController();
    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockOrganization = {
        legalName: 'Mock Organization',
        industrialSector: 'Mock Industry',
        address: 'Mock Address',
        city: 'Mock City',
        postalCode: 'Mock Postal Code',
        region: 'Mock Region',
        countryCode: 'Mock Country Code',
        role: OrganizationRole.IMPORTER,
        telephone: 'Mock Telephone',
        email: 'Mock Email',
        image: 'Mock Image'
    };
    const mockRecipient = {
        email: 'recipient@email.com',
        name: 'Recipient Name',
        qrCode: 'Mock QR Code'
    }
    const mockOrganizationPresentation: OrganizationPresentation = {
        visibilityLevel: { BROAD: null },
        ethAddress: mockEthAddress,
        legalName: mockOrganization.legalName,
        industrialSector: [mockOrganization.industrialSector],
        address: [mockOrganization.address],
        city: [mockOrganization.city],
        postalCode: [mockOrganization.postalCode],
        region: [mockOrganization.region],
        countryCode: [mockOrganization.countryCode],
        role: [{ IMPORTER: null }],
        telephone: [mockOrganization.telephone],
        email: [mockOrganization.email],
        image: [mockOrganization.image]
    };

    it.each([
        {
            controllerFunctionName: 'inviteOrganization',
            controllerFunction: () => organizationController.inviteOrganization(mockRecipient.email, mockRecipient.name),
            serviceFunction: emailServiceInstanceMock.inviteOrganization,
            expectedResult: [undefined],
            expectedDecorators: [update]
        },
        {
            controllerFunctionName: 'sendOrganizationCredential',
            controllerFunction: () => organizationController.sendOrganizationCredential(mockRecipient.email, mockRecipient.name, mockRecipient.qrCode),
            serviceFunction: emailServiceInstanceMock.sendOrganizationCredential,
            expectedResult: [undefined],
            expectedDecorators: [update]
        },
        {
            controllerFunctionName: 'getOrganizations',
            controllerFunction: () => organizationController.getOrganizations(),
            serviceFunction: organizationServiceInstanceMock.getOrganizations,
            expectedResult: [mockOrganizationPresentation],
            expectedDecorators: [query]
        },
        {
            controllerFunctionName: 'getOrganization',
            controllerFunction: () => organizationController.getOrganization(mockEthAddress),
            serviceFunction: organizationServiceInstanceMock.getOrganization,
            expectedResult: mockOrganizationPresentation,
            expectedDecorators: [query]
        },
        {
            controllerFunctionName: 'createOrganization',
            controllerFunction: () => organizationController.createOrganization(
                mockOrganization.legalName,
                mockOrganization.industrialSector,
                mockOrganization.address,
                mockOrganization.city,
                mockOrganization.postalCode,
                mockOrganization.region,
                mockOrganization.countryCode,
                { IMPORTER: null } as OrganizationRoleType,
                mockOrganization.telephone,
                mockOrganization.email,
                mockOrganization.image
            ),
            serviceFunction: organizationServiceInstanceMock.createOrganization,
            expectedResult: mockOrganizationPresentation,
            expectedDecorators: [update]
        },
        {
            controllerFunctionName: 'updateOrganization',
            controllerFunction: () => organizationController.updateOrganization(
                mockEthAddress,
                mockOrganization.legalName,
                mockOrganization.industrialSector,
                mockOrganization.address,
                mockOrganization.city,
                mockOrganization.postalCode,
                mockOrganization.region,
                mockOrganization.countryCode,
                { IMPORTER: null } as OrganizationRoleType,
                mockOrganization.telephone,
                mockOrganization.email,
                mockOrganization.image
            ),
            serviceFunction: organizationServiceInstanceMock.updateOrganization,
            expectedResult: mockOrganizationPresentation,
            expectedDecorators: [update]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
