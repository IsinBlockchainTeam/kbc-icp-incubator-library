import {createMock} from "ts-auto-mock";
import {RoleProof} from "@kbc-lib/azle-types";
import {AuthenticationService} from "../AuthenticationService";
import {AuthenticationDriver} from "../../../drivers/icp/AuthenticationDriver";

describe('AuthenticationService', () => {
    let authenticationService: AuthenticationService;
    const mockedFn = {
        login: jest.fn(),
        refresh: jest.fn(),
        logout: jest.fn(),
    }

    beforeAll(() => {
        const authenticationDriver = createMock<AuthenticationDriver>({
            login: mockedFn.login,
            refresh: mockedFn.refresh,
            logout: mockedFn.logout,

        });
        authenticationService = new AuthenticationService(authenticationDriver);
    });

    it.each([
        {
            functionName: 'login',
            serviceFunction: () => authenticationService.login({} as RoleProof),
            driverFunction: mockedFn.login,
            driverFunctionResult: true,
            driverFunctionArgs: [{} as RoleProof]
        }, {
            functionName: 'getMaterial',
            serviceFunction: () => authenticationService.refresh(),
            driverFunction: mockedFn.refresh,
            driverFunctionResult: true,
            driverFunctionArgs: []
        }, {
            functionName: 'createMaterial',
            serviceFunction: () => authenticationService.logout(),
            driverFunction: mockedFn.logout,
            driverFunctionResult: true,
            driverFunctionArgs: []
        }
    ])(`should call driver function $functionName`, async ({serviceFunction, driverFunction, driverFunctionResult, driverFunctionArgs}) => {
        driverFunction.mockReturnValue(driverFunctionResult);
        await expect(serviceFunction()).resolves.toEqual(driverFunctionResult);
        expect(driverFunction).toHaveBeenCalled();
        expect(driverFunction).toHaveBeenCalledWith(...driverFunctionArgs);
    });
});
