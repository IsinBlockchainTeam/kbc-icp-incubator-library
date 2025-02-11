import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { OrganizationRole, OrganizationVisibilityLevel } from '@kbc-lib/azle-types';
import { OrganizationDriver } from '../OrganizationDriver';
import { Organization } from '../../entities/organization/Organization';
import { BroadedOrganizationCreator } from '../../factories/organization/BroadedOrganizationCreator';
import { NarrowedOrganizationCreator } from '../../factories/organization/NarrowedOrganizationCreator';
import { OrganizationVisibilityLevelFactory } from '../../factories/organization/OrganizationVisibilityLevelFactory';
import { OrganizationRoleFactory } from '../../factories/organization/OrganizationRoleFactory';
import {mockOrganizations} from '../../__shared__/constants/mock-data';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../factories/organization/BroadedOrganizationCreator');
jest.mock('../../factories/organization/NarrowedOrganizationCreator');
jest.mock('../../factories/organization/OrganizationVisibilityLevelFactory');
jest.mock('../../factories/organization/OrganizationRoleFactory');

describe('OrganizationDriver', () => {
    let organizationDriver: OrganizationDriver;
    const mockFn = {
        inviteOrganization: jest.fn(),
        sendOrganizationCredential: jest.fn(),
        getOrganizations: jest.fn(),
        getOrganization: jest.fn(),
        createOrganization: jest.fn(),
        updateOrganization: jest.fn(),
        deleteOrganization: jest.fn()
    };

    const defaultOrganization = {} as Organization;
    const mockEthAddress = '0x123';
    const recipientMock = {
        email: 'recipient@email.com',
        name: 'Recipient Name',
        qrCode: 'Mock QR Code'
    }

    const mockOrganizationParams = mockOrganizations[0];

    beforeAll(() => {
        (createActor as jest.Mock).mockReturnValue({
            inviteOrganization: mockFn.inviteOrganization,
            sendOrganizationCredential: mockFn.sendOrganizationCredential,
            getOrganizations: mockFn.getOrganizations,
            getOrganization: mockFn.getOrganization,
            createOrganization: mockFn.createOrganization,
            updateOrganization: mockFn.updateOrganization,
            deleteOrganization: mockFn.deleteOrganization
        });

        const icpIdentity = {} as Identity;
        organizationDriver = new OrganizationDriver(icpIdentity, 'canisterId');

        // Mock factory methods
        (OrganizationVisibilityLevelFactory.prototype.fromICPType as jest.Mock).mockReturnValue(OrganizationVisibilityLevel.BROAD);
        (OrganizationRoleFactory.prototype.toICPType as jest.Mock).mockReturnValue(OrganizationRole.EXPORTER);
        (BroadedOrganizationCreator.prototype.createOrganization as jest.Mock).mockReturnValue(defaultOrganization);
        (NarrowedOrganizationCreator.prototype.createOrganization as jest.Mock).mockReturnValue(defaultOrganization);
    });

    it('should invite an organization', async () => {
        const result = await organizationDriver.inviteOrganization(recipientMock.email, recipientMock.name);

        expect(result).toBeUndefined();
        expect(mockFn.inviteOrganization).toHaveBeenCalledWith(recipientMock.email, recipientMock.name);
    });

    it('should send organization credential', async () => {
        const result = await organizationDriver.sendOrganizationCredential(recipientMock.email, recipientMock.name, recipientMock.qrCode);

        expect(result).toBeUndefined();
        expect(mockFn.sendOrganizationCredential).toHaveBeenCalledWith(recipientMock.email, recipientMock.name, recipientMock.qrCode);
    });

    it('should retrieve organizations', async () => {
        const rawOrganization = { visibilityLevel: 'BROAD' };
        mockFn.getOrganizations.mockResolvedValue([rawOrganization]);

        const result = await organizationDriver.getOrganizations();

        expect(result).toEqual([defaultOrganization]);
        expect(mockFn.getOrganizations).toHaveBeenCalled();
        expect(OrganizationVisibilityLevelFactory.prototype.fromICPType).toHaveBeenCalledWith('BROAD');
        expect(BroadedOrganizationCreator.prototype.createOrganization).toHaveBeenCalledWith(rawOrganization);
    });

    it('should retrieve a single organization', async () => {
        const rawOrganization = { visibilityLevel: 'BROAD' };
        mockFn.getOrganization.mockResolvedValue(rawOrganization);

        const result = await organizationDriver.getOrganization(mockEthAddress);

        expect(result).toEqual(defaultOrganization);
        expect(mockFn.getOrganization).toHaveBeenCalledWith(mockEthAddress);
        expect(OrganizationVisibilityLevelFactory.prototype.fromICPType).toHaveBeenCalledWith('BROAD');
        expect(BroadedOrganizationCreator.prototype.createOrganization).toHaveBeenCalledWith(rawOrganization);
    });

    it('should create an organization', async () => {
        const rawOrganization = { visibilityLevel: 'BROAD' };
        mockFn.createOrganization.mockResolvedValue(rawOrganization);

        const result = await organizationDriver.createOrganization(mockOrganizationParams);

        expect(result).toEqual(defaultOrganization);
        expect(mockFn.createOrganization).toHaveBeenCalledWith(
            mockOrganizationParams.legalName,
            mockOrganizationParams.industrialSector,
            mockOrganizationParams.address,
            mockOrganizationParams.city,
            mockOrganizationParams.postalCode,
            mockOrganizationParams.region,
            mockOrganizationParams.countryCode,
            mockOrganizationParams.role,
            mockOrganizationParams.telephone,
            mockOrganizationParams.email,
            mockOrganizationParams.image
        );
        expect(BroadedOrganizationCreator.prototype.createOrganization).toHaveBeenCalledWith(rawOrganization);
    });

    it('should update an organization', async () => {
        const rawOrganization = { visibilityLevel: 'BROAD' };
        mockFn.updateOrganization.mockResolvedValue(rawOrganization);

        const result = await organizationDriver.updateOrganization(mockEthAddress, mockOrganizationParams);

        expect(result).toEqual(defaultOrganization);
        expect(mockFn.updateOrganization).toHaveBeenCalledWith(
            mockEthAddress,
            mockOrganizationParams.legalName,
            mockOrganizationParams.industrialSector,
            mockOrganizationParams.address,
            mockOrganizationParams.city,
            mockOrganizationParams.postalCode,
            mockOrganizationParams.region,
            mockOrganizationParams.countryCode,
            mockOrganizationParams.role,
            mockOrganizationParams.telephone,
            mockOrganizationParams.email,
            mockOrganizationParams.image
        );
        expect(BroadedOrganizationCreator.prototype.createOrganization).toHaveBeenCalledWith(rawOrganization);
    });

    it('should delete an organization', async () => {
        mockFn.deleteOrganization.mockResolvedValue(true);

        const result = await organizationDriver.deleteOrganization(mockEthAddress);

        expect(result).toBe(true);
        expect(mockFn.deleteOrganization).toHaveBeenCalledWith(mockEthAddress);
    });

    it('should handle narrow visibility level organizations', async () => {
        const rawOrganization = { visibilityLevel: 'NARROW' };
        (OrganizationVisibilityLevelFactory.prototype.fromICPType as jest.Mock).mockReturnValue(OrganizationVisibilityLevel.NARROW);
        mockFn.getOrganization.mockResolvedValue(rawOrganization);

        const result = await organizationDriver.getOrganization(mockEthAddress);

        expect(result).toEqual(defaultOrganization);
        expect(NarrowedOrganizationCreator.prototype.createOrganization).toHaveBeenCalledWith(rawOrganization);
    });

    it('should throw error for invalid visibility level', async () => {
        const rawOrganization = { visibilityLevel: 'INVALID' };
        (OrganizationVisibilityLevelFactory.prototype.fromICPType as jest.Mock).mockReturnValue('INVALID' as any);
        mockFn.getOrganization.mockResolvedValue(rawOrganization);

        await expect(organizationDriver.getOrganization(mockEthAddress))
            .rejects
            .toThrow('Invalid organization visibility level: INVALID');
    });
});
