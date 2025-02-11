import { createMock } from 'ts-auto-mock';
import { OrganizationService } from '../OrganizationService';
import { OrganizationDriver, OrganizationParams } from '../../drivers/OrganizationDriver';
import { Organization } from '../../entities/organization/Organization';
import { mockOrganizations } from '../../__shared__/constants/mock-data';
import { BroadedOrganization } from '../../entities/organization/BroadedOrganization';

describe('OrganizationService', () => {
    let organizationService: OrganizationService;
    const mockedFn = {
        inviteOrganization: jest.fn(),
        sendOrganizationCredential: jest.fn(),
        getOrganizations: jest.fn(),
        getOrganization: jest.fn(),
        createOrganization: jest.fn(),
        updateOrganization: jest.fn()
    };

    const mockEthAddress = '0x1234567890123456789012345678901234567890';
    const mockParams: OrganizationParams = mockOrganizations[0];
    const mockOrganization: Organization = new BroadedOrganization(
        mockEthAddress,
        mockParams.legalName,
        mockParams.industrialSector,
        mockParams.address,
        mockParams.city,
        mockParams.postalCode,
        mockParams.region,
        mockParams.countryCode,
        mockParams.role,
        mockParams.telephone,
        mockParams.email,
        mockParams.image
    );
    const recipientMock = {
        email: 'recipient@email.com',
        name: 'Recipient Name',
        qrCode: 'Mock QR Code'
    }

    beforeAll(() => {
        const organizationDriver = createMock<OrganizationDriver>({
            inviteOrganization: mockedFn.inviteOrganization,
            sendOrganizationCredential: mockedFn.sendOrganizationCredential,
            getOrganizations: mockedFn.getOrganizations,
            getOrganization: mockedFn.getOrganization,
            createOrganization: mockedFn.createOrganization,
            updateOrganization: mockedFn.updateOrganization
        });
        organizationService = new OrganizationService(organizationDriver);
    });

    it.each([
        {
            functionName: 'inviteOrganization',
            serviceFunction: () => organizationService.inviteOrganization(recipientMock.email, recipientMock.name),
            driverFunction: mockedFn.inviteOrganization,
            driverFunctionResult: [undefined],
            driverFunctionArgs: [recipientMock.email, recipientMock.name]
        },
        {
            functionName: 'sendOrganizationCredential',
            serviceFunction: () => organizationService.sendOrganizationCredential(recipientMock.email, recipientMock.name, recipientMock.qrCode),
            driverFunction: mockedFn.sendOrganizationCredential,
            driverFunctionResult: [undefined],
            driverFunctionArgs: [recipientMock.email, recipientMock.name, recipientMock.qrCode]
        },
        {
            functionName: 'getOrganizations',
            serviceFunction: () => organizationService.getOrganizations(),
            driverFunction: mockedFn.getOrganizations,
            driverFunctionResult: [mockOrganization],
            driverFunctionArgs: []
        },
        {
            functionName: 'getOrganization',
            serviceFunction: () => organizationService.getOrganization(mockEthAddress),
            driverFunction: mockedFn.getOrganization,
            driverFunctionResult: mockOrganization,
            driverFunctionArgs: [mockEthAddress]
        },
        {
            functionName: 'createOrganization',
            serviceFunction: () => organizationService.createOrganization(mockParams),
            driverFunction: mockedFn.createOrganization,
            driverFunctionResult: mockOrganization,
            driverFunctionArgs: [mockParams]
        },
        {
            functionName: 'updateOrganization',
            serviceFunction: () => organizationService.updateOrganization(mockEthAddress, mockParams),
            driverFunction: mockedFn.updateOrganization,
            driverFunctionResult: mockOrganization,
            driverFunctionArgs: [mockEthAddress, mockParams]
        }
    ])(
        `should call driver function $functionName`,
        async ({ serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs }) => {
            driverFunction.mockReturnValue(driverFunctionResult);
            await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
            expect(driverFunction).toHaveBeenCalled();
            expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
        }
    );
});
