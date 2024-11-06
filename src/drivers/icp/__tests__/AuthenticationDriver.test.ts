import { createActor } from 'icp-declarations/entity_manager';
import type {Identity} from "@dfinity/agent";
import {RoleProof} from "@kbc-lib/azle-types";
import {AuthenticationDriver} from "../AuthenticationDriver";

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('AuthenticationDriver', () => {
    let authenticationDriver: AuthenticationDriver;
    const mockFn = {
        authenticate: jest.fn(),
    }

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            authenticate: mockFn.authenticate,
        });
        const icpIdentity = {} as Identity;
        authenticationDriver = new AuthenticationDriver(icpIdentity, 'canisterId');
    });

    it('should login', async () => {
        const roleProof = {} as RoleProof;
        mockFn.authenticate.mockReturnValue(true);
        await expect(authenticationDriver.authenticate(roleProof)).resolves.toBeTruthy();
        expect(mockFn.authenticate).toHaveBeenCalled();
        expect(mockFn.authenticate).toHaveBeenCalledWith(roleProof);
    });
});
