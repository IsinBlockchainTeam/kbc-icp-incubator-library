import { update } from 'azle';
import AuthenticationController from '../AuthenticationController';
import AuthenticationService from '../../services/AuthenticationService';
import { RoleProof } from '../../models/types';

jest.mock('azle');
jest.mock('../../decorators/roles');
jest.mock('../../models/idls');
jest.mock('../../services/AuthenticationService', () => ({
    instance: {
        authenticate: jest.fn(),
        logout: jest.fn()
    }
}));
describe('AuthenticationController', () => {
    const authenticationServiceInstanceMock = AuthenticationService.instance as jest.Mocked<AuthenticationService>;
    const authenticationController = new AuthenticationController();

    it.each([
        {
            controllerFunctionName: 'authenticate',
            controllerFunction: () => authenticationController.authenticate({} as RoleProof),
            serviceFunction: authenticationServiceInstanceMock.authenticate,
            expectedResult: [],
            expectedArguments: [{} as RoleProof],
            expectedDecorators: [update]
        },
        {
            controllerFunctionName: 'logout',
            controllerFunction: () => authenticationController.logout(),
            serviceFunction: authenticationServiceInstanceMock.logout,
            expectedResult: undefined,
            expectedArguments: [],
            expectedDecorators: [update]
        }
    ])('should pass service $controllerFunctionName', async ({ controllerFunction, serviceFunction, expectedResult, expectedArguments, expectedDecorators }) => {
        serviceFunction.mockReturnValue(expectedResult as any);
        await expect(controllerFunction()).resolves.toEqual(expectedResult);
        expect(serviceFunction).toHaveBeenCalled();
        expect(serviceFunction).toHaveBeenCalledWith(...expectedArguments);
        for (const decorator of expectedDecorators) {
            expect(decorator).toHaveBeenCalled();
        }
    });
});
