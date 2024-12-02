import AuthenticationController from "../AuthenticationController";
import AuthenticationService from "../../services/AuthenticationService";
import {RoleProof} from "../../models/types";
import {update} from "azle";
jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AuthenticationService', () => {
    return {
        instance: {
            authenticate: jest.fn(),
            logout: jest.fn()
        }
    };
});
describe('AuthenticationController', () => {
    let authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;
    let authenticationController = new AuthenticationController();

    it.each([
        {
            controllerFunctionName: 'authenticate',
            controllerFunction: () => authenticationController.authenticate({} as RoleProof),
            serviceFunction: authenticationServiceInstanceMock.authenticate,
            expectedResult: [],
            expectedDecorators: [update],
        }, {
            controllerFunctionName: 'logout',
            controllerFunction: () => authenticationController.logout(),
            serviceFunction: authenticationServiceInstanceMock.logout,
            expectedResult: null,
            expectedDecorators: [update],
        }
    ])
    ('should cass service $serviceFunctionName', async (
        {controllerFunction, serviceFunction, expectedResult, expectedDecorators}
    ) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
