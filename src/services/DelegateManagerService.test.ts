import { createMock } from 'ts-auto-mock';
import { DelegateManagerDriver } from '../drivers/DelegateManagerDriver';
import { DelegateManagerService } from './DelegateManagerService';
import { RoleProof } from '../types/RoleProof';

describe('DelegateManagerService', () => {
    const mockedDelegateManagerDriver = createMock<DelegateManagerDriver>({
        getRevocationRegistryAddress: jest.fn(),
        hasValidRole: jest.fn()
    });

    const delegatorService = new DelegateManagerService(mockedDelegateManagerDriver);

    const roleProof = createMock<RoleProof>();

    beforeEach(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'getRevocationRegistryAddress',
            serviceFunction: () => delegatorService.getRevocationRegistryAddress(),
            expectedMockedFunction: mockedDelegateManagerDriver.getRevocationRegistryAddress,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'hasValidRole',
            serviceFunction: () => delegatorService.hasValidRole(roleProof, 'role'),
            expectedMockedFunction: mockedDelegateManagerDriver.hasValidRole,
            expectedMockedFunctionArgs: [roleProof, 'role']
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
