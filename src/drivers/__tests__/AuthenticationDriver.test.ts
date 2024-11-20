import { createActor } from 'icp-declarations/entity_manager';
import type { Identity } from '@dfinity/agent';
import { RoleProof } from '../../types/RoleProof';
import { AuthenticationDriver } from '../AuthenticationDriver';
import { EntityBuilder } from '../../utils/EntityBuilder';
import { RoleProof as ICPRoleProof } from '@isinblockchainteam/azle-types';

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');
jest.mock('../../utils/EntityBuilder');

describe('AuthenticationDriver', () => {
    let authenticationDriver: AuthenticationDriver;
    const mockFn = {
        authenticate: jest.fn()
    };

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            authenticate: mockFn.authenticate
        });
        const icpIdentity = {} as Identity;
        authenticationDriver = new AuthenticationDriver(icpIdentity, 'canisterId');
        jest.spyOn(EntityBuilder, 'buildICPRoleProof').mockReturnValue({} as ICPRoleProof);
    });

    it('should authenticate', async () => {
        const roleProof = {} as RoleProof;
        mockFn.authenticate.mockReturnValue(true);
        await expect(authenticationDriver.authenticate(roleProof)).resolves.toBeTruthy();
        expect(mockFn.authenticate).toHaveBeenCalled();
        expect(mockFn.authenticate).toHaveBeenCalledWith(roleProof);
    });
});
