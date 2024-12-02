import {StableBTreeMap} from "azle";
import {ic} from "azle/experimental";
import AuthenticationService from "../AuthenticationService";
import DelegationService from "../DelegationService";
import {RoleProof, ROLES} from "../../models/types";
import {getLoginDuration} from "../../utils/env";
import {NotAuthenticatedError, NotValidCredentialError} from "../../models/errors";

jest.mock('azle');
jest.mock('azle/experimental', () => ({
        ic: {
            time: jest.fn(),
            caller: jest.fn()
        }
    }));
jest.mock('../../services/DelegationService', () => ({
        instance: {
            hasValidRoleProof: jest.fn(),
        }
    }));
jest.mock('../../utils/env', () => ({
        getLoginDuration: jest.fn()
    }));

describe("AuthenticationService", () => {
    let authenticationService: AuthenticationService;
    const delegationServiceInstanceMock = DelegationService.instance as jest.Mocked<DelegationService>;

    const mockedFn = {
        values: jest.fn(),
        get: jest.fn(),
        keys: jest.fn(),
        insert: jest.fn(),
        containsKey: jest.fn(),
        remove: jest.fn()
    };

    beforeEach(() => {
        (StableBTreeMap as jest.Mock).mockReturnValue({
            values: mockedFn.values,
            get: mockedFn.get,
            keys: mockedFn.keys,
            insert: mockedFn.insert,
            containsKey: mockedFn.containsKey,
            remove: mockedFn.remove
        });
        (getLoginDuration as jest.Mock).mockReturnValue(100);
        authenticationService = AuthenticationService.instance;
    });

    it("should authenticate", async () => {
        (ic.time as jest.Mock).mockReturnValue({
            toString: () => "0"
        });
        (ic.caller as jest.Mock).mockReturnValue({
            toText: () => "0xcaller"
        });
        delegationServiceInstanceMock.hasValidRoleProof.mockResolvedValue(true);
        await authenticationService.authenticate({} as RoleProof);
        expect(mockedFn.insert).toHaveBeenCalled();
        expect(mockedFn.insert).toHaveBeenCalledWith("0xcaller", {
            roleProof: {},
            expiration: 100
        });

        delegationServiceInstanceMock.hasValidRoleProof.mockResolvedValue(false);
        await expect(authenticationService.authenticate({} as RoleProof)).rejects.toThrow(NotValidCredentialError);
    });
    it("should logout", async () => {
        (ic.caller as jest.Mock).mockReturnValue({
            toText: () => "0xcaller"
        });
        mockedFn.containsKey.mockReturnValue(true);
        await authenticationService.logout();
        expect(mockedFn.remove).toHaveBeenCalled();
        expect(mockedFn.remove).toHaveBeenCalledWith("0xcaller");

        mockedFn.containsKey.mockReturnValue(false);
        await expect(authenticationService.logout()).rejects.toThrow(NotAuthenticatedError);
    });
    it("should get delegator address", () => {
        (ic.caller as jest.Mock).mockReturnValue({
            toText: () => "0xcaller"
        });
        mockedFn.get.mockReturnValue({
            roleProof: {
                membershipProof: {
                    delegatorAddress: "0xdelegator"
                }
            }
        });
        expect(authenticationService.getDelegatorAddress()).toEqual("0xdelegator");
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => authenticationService.getDelegatorAddress()).toThrow(NotAuthenticatedError);
    });
    it("should get role", () => {
        (ic.caller as jest.Mock).mockReturnValue({
            toText: () => "0xcaller"
        });
        mockedFn.get.mockReturnValue({
            roleProof: {
                role: "role"
            }
        });
        expect(authenticationService.getRole()).toEqual("role");
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(() => authenticationService.getRole()).toThrow(NotAuthenticatedError);
    });
    it("should check if caller is authenticated", () => {
        (ic.time as jest.Mock).mockReturnValue({
            toString: () => "0"
        });
        (ic.caller as jest.Mock).mockReturnValue({
            toText: () => "0xcaller"
        });
        mockedFn.get.mockReturnValue({
            expiration: 100
        });
        expect(authenticationService.isAuthenticated(ic.caller())).toBeTruthy();
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(authenticationService.isAuthenticated(ic.caller())).toBeFalsy();
    });
    it("should check if caller is at least a certain role", () => {
        (ic.time as jest.Mock).mockReturnValue({
            toString: () => "0"
        });
        (ic.caller as jest.Mock).mockReturnValue({
            toText: () => "0xcaller"
        });
        mockedFn.get.mockReturnValue({
            roleProof: {
                role: ROLES.EDITOR
            },
            expiration: 100
        });
        expect(authenticationService.isAtLeast(ic.caller(), ROLES.EDITOR)).toBeTruthy();
        expect(mockedFn.get).toHaveBeenCalled();

        mockedFn.get.mockReturnValue(undefined);
        expect(authenticationService.isAtLeast(ic.caller(), ROLES.EDITOR)).toBeFalsy();
        mockedFn.get.mockReturnValue({
            roleProof: {
                role: ROLES.VIEWER
            },
            expiration: 100
        });
        expect(authenticationService.isAtLeast(ic.caller(), ROLES.EDITOR)).toBeFalsy();
    });
});
