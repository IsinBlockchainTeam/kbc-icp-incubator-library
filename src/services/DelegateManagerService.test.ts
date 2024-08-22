import { createMock } from 'ts-auto-mock';
import { DelegateManagerDriver } from '../drivers/DelegateManagerDriver';
import { DelegateManagerService } from './DelegateManagerService';

describe('DelegateManagerService', () => {
    const mockedDelegateManagerDriver = createMock<DelegateManagerDriver>({
        addDelegator: jest.fn(),
        removeDelegator: jest.fn(),
        isDelegator: jest.fn(),
        addDelegate: jest.fn(),
        removeDelegate: jest.fn(),
        isDelegate: jest.fn()
    });

    const delegatorService = new DelegateManagerService(mockedDelegateManagerDriver);

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
            serviceFunctionName: 'addDelegate',
            serviceFunction: () => delegatorService.addDelegate('delegateAddress'),
            expectedMockedFunction: mockedDelegateManagerDriver.addDelegate,
            expectedMockedFunctionArgs: ['delegateAddress']
        },
        {
            serviceFunctionName: 'removeDelegate',
            serviceFunction: () => delegatorService.removeDelegate('delegateAddress'),
            expectedMockedFunction: mockedDelegateManagerDriver.removeDelegate,
            expectedMockedFunctionArgs: ['delegateAddress']
        },
        {
            serviceFunctionName: 'isDelegate',
            serviceFunction: () => delegatorService.isDelegate('delegateAddress'),
            expectedMockedFunction: mockedDelegateManagerDriver.isDelegate,
            expectedMockedFunctionArgs: ['delegateAddress']
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
