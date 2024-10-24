import { createActor } from 'icp-declarations/entity_manager';
import type {Identity} from "@dfinity/agent";
import {RoleProof} from "@kbc-lib/azle-types";
import {AuthenticationDriver} from "../AuthenticationDriver";

jest.mock('icp-declarations/entity_manager');
jest.mock('@dfinity/agent');

describe('AuthenticationDriver', () => {
    let authenticationDriver: AuthenticationDriver;
    const mockFn = {
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
    }

    beforeAll(async () => {
        (createActor as jest.Mock).mockReturnValue({
            login: mockFn.login,
            refresh: mockFn.refresh,
            logout: mockFn.logout,
        });
        const icpIdentity = {} as Identity;
        authenticationDriver = new AuthenticationDriver(icpIdentity, 'canisterId');
    });

    it('should login', async () => {
        const roleProof = {} as RoleProof;
        mockFn.login.mockReturnValue(true);
        await expect(authenticationDriver.login(roleProof)).resolves.toBeTruthy();
        expect(mockFn.login).toHaveBeenCalled();
        expect(mockFn.login).toHaveBeenCalledWith(roleProof);
    });

    it('should refresh', async () => {
        mockFn.refresh.mockReturnValue(true);
        await expect(authenticationDriver.refresh()).resolves.toBeTruthy();
        expect(mockFn.refresh).toHaveBeenCalled();
    });

    it('should logout', async () => {
        mockFn.logout.mockReturnValue(true);
        await expect(authenticationDriver.logout()).resolves.toBeTruthy();
        expect(mockFn.logout).toHaveBeenCalled();
    });
});
