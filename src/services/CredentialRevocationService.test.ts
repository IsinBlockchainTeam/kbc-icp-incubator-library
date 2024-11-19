import { CredentialRevocationDriver } from '../drivers/CredentialRevocationDriver';
import { createMock } from 'ts-auto-mock';
import { CredentialRevocationService } from './CredentialRevocationService';

describe('CredentialRevocationService', () => {
    const mockedCredentialRevocationDriver = createMock<CredentialRevocationDriver>({
        revoke: jest.fn(),
        revoked: jest.fn()
    });

    const credentialRevocationService = new CredentialRevocationService(
        mockedCredentialRevocationDriver
    );

    beforeEach(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'revoke',
            serviceFunction: () => credentialRevocationService.revoke('jwt'),
            expectedMockedFunction: mockedCredentialRevocationDriver.revoke,
            expectedMockedFunctionArgs: ['jwt']
        },
        {
            serviceFunctionName: 'revoked',
            serviceFunction: () => credentialRevocationService.revoked('jwt'),
            expectedMockedFunction: mockedCredentialRevocationDriver.revoked,
            expectedMockedFunctionArgs: ['jwt']
        }
    ])(
        'should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenNthCalledWith(
                1,
                ...expectedMockedFunctionArgs
            );
        }
    );
});
