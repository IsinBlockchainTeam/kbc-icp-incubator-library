import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { RoleProof } from '../../types/RoleProof';
import { AuthenticationDriver } from '../AuthenticationDriver';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('AuthenticationDriver', () => {
    let authenticationDriver: AuthenticationDriver;
    const mockFn = {
        authenticate: jest.fn(),
        logout: jest.fn()
    };

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            authenticate: mockFn.authenticate,
            logout: mockFn.logout
        });
        const icpIdentity = {} as Identity;
        authenticationDriver = new AuthenticationDriver(icpIdentity, 'canisterId');
    });

    it('should authenticate', async () => {
        const roleProof = {} as RoleProof;
        mockFn.authenticate.mockReturnValue(true);
        await expect(authenticationDriver.authenticate(roleProof)).resolves.toBeTruthy();
        expect(mockFn.authenticate).toHaveBeenCalled();
    });

    it('should logout', async () => {
        mockFn.authenticate.mockReturnValue(true);
        await authenticationDriver.logout();
        expect(mockFn.logout).toHaveBeenCalled();
    });
});
