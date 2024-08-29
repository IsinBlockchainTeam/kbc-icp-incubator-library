import { createMock } from 'ts-auto-mock';
import { DelegateManagerDriver } from '../drivers/DelegateManagerDriver';
import { DelegateManagerService } from './DelegateManagerService';
import { RoleProof } from '../types/RoleProof';

describe('DelegateManagerService', () => {
    const mockedDelegateManagerDriver = createMock<DelegateManagerDriver>({
        addDelegator: jest.fn(),
        removeDelegator: jest.fn(),
        isDelegator: jest.fn(),
        hasValidRole: jest.fn()
    });

    const delegatorService = new DelegateManagerService(mockedDelegateManagerDriver);

    const roleProof = createMock<RoleProof>();

    beforeEach(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'addDelegator',
            serviceFunction: () => delegatorService.addDelegator('delegatorAddress'),
            expectedMockedFunction: mockedDelegateManagerDriver.addDelegator,
            expectedMockedFunctionArgs: ['delegatorAddress']
        },
        {
            serviceFunctionName: 'removeDelegator',
            serviceFunction: () => delegatorService.removeDelegator('delegatorAddress'),
            expectedMockedFunction: mockedDelegateManagerDriver.removeDelegator,
            expectedMockedFunctionArgs: ['delegatorAddress']
        },
        {
            serviceFunctionName: 'isDelegator',
            serviceFunction: () => delegatorService.isDelegator('delegatorAddress'),
            expectedMockedFunction: mockedDelegateManagerDriver.isDelegator,
            expectedMockedFunctionArgs: ['delegatorAddress']
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
