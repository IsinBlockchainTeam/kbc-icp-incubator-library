import { createMock } from 'ts-auto-mock';
import { RoleProof } from '../../types/RoleProof';
import { AuthenticationService } from '../AuthenticationService';
import { AuthenticationDriver } from '../../drivers/AuthenticationDriver';

describe('AuthenticationService', () => {
    let authenticationService: AuthenticationService;
    const mockedFn = {
        authenticate: jest.fn(),
        logout: jest.fn()
    };

    beforeAll(() => {
        const authenticationDriver = createMock<AuthenticationDriver>({
            authenticate: mockedFn.authenticate,
            logout: mockedFn.logout
        });
        authenticationService = new AuthenticationService(authenticationDriver);
    });

    it.each([
        {
            functionName: 'authenticate',
            serviceFunction: () => authenticationService.authenticate({} as RoleProof),
            driverFunction: mockedFn.authenticate,
            driverFunctionResult: true,
            driverFunctionArgs: [{} as RoleProof]
        },
        {
            functionName: 'logout',
            serviceFunction: () => authenticationService.logout(),
            driverFunction: mockedFn.logout,
            driverFunctionResult: true,
            driverFunctionArgs: []
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
