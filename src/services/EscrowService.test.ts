import { createMock } from 'ts-auto-mock';
import { EscrowService } from './EscrowService';
import { EscrowDriver } from '../drivers/EscrowDriver';

describe('EscrowService', () => {
    let escrowService: EscrowService;

    let mockedEscrowDriver: EscrowDriver;
    const mockedInstance = {
        getOwner: jest.fn(),
        getPayee: jest.fn(),
        getPayers: jest.fn(),
        getDeployedAt: jest.fn(),
        getDuration: jest.fn(),
        getDeadline: jest.fn(),
        getTokenAddress: jest.fn(),
        getFeeRecipient: jest.fn(),
        getBaseFee: jest.fn(),
        getPercentageFee: jest.fn(),
        getFees: jest.fn(),
        getTotalDepositedAmount: jest.fn(),
        getDepositedAmount: jest.fn(),
        getLockedAmount: jest.fn(),
        getReleasableAmount: jest.fn(),
        getReleasedAmount: jest.fn(),
        getTotalRefundableAmount: jest.fn(),
        getRefundedAmount: jest.fn(),
        getTotalRefundedAmount: jest.fn(),
        getBalance: jest.fn(),
        getWithdrawableAmount: jest.fn(),
        getRefundableAmount: jest.fn(),
        updateFeeRecipient: jest.fn(),
        updateBaseFee: jest.fn(),
        updatePercentageFee: jest.fn(),
        isExpired: jest.fn(),
        lockFunds: jest.fn(),
        releaseFunds: jest.fn(),
        refundFunds: jest.fn(),
        deposit: jest.fn(),
        withdraw: jest.fn(),
        addAdmin: jest.fn(),
        removeAdmin: jest.fn(),
    };

    const depositAmount = 10;

    beforeAll(() => {
        mockedEscrowDriver = createMock<EscrowDriver>(mockedInstance);

        escrowService = new EscrowService(mockedEscrowDriver);
    });

    afterAll(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'getOwner',
            serviceFunction: () => escrowService.getOwner(),
            expectedMockedFunction: mockedInstance.getOwner,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getPayee',
            serviceFunction: () => escrowService.getPayee(),
            expectedMockedFunction: mockedInstance.getPayee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getPayers',
            serviceFunction: () => escrowService.getPayers(),
            expectedMockedFunction: mockedInstance.getPayers,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDeployedAt',
            serviceFunction: () => escrowService.getDeployedAt(),
            expectedMockedFunction: mockedInstance.getDeployedAt,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDuration',
            serviceFunction: () => escrowService.getDuration(),
            expectedMockedFunction: mockedInstance.getDuration,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDeadline',
            serviceFunction: () => escrowService.getDeadline(),
            expectedMockedFunction: mockedInstance.getDeadline,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getTokenAddress',
            serviceFunction: () => escrowService.getTokenAddress(),
            expectedMockedFunction: mockedInstance.getTokenAddress,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getFeeRecipient',
            serviceFunction: () => escrowService.getFeeRecipient(),
            expectedMockedFunction: mockedInstance.getFeeRecipient,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getBaseFee',
            serviceFunction: () => escrowService.getBaseFee(),
            expectedMockedFunction: mockedInstance.getBaseFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getPercentageFee',
            serviceFunction: () => escrowService.getPercentageFee(),
            expectedMockedFunction: mockedInstance.getPercentageFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getFees',
            serviceFunction: () => escrowService.getFees(10),
            expectedMockedFunction: mockedInstance.getFees,
            expectedMockedFunctionArgs: [10]
        },
        {
            serviceFunctionName: 'getTotalDepositedAmount',
            serviceFunction: () => escrowService.getTotalDepositedAmount(),
            expectedMockedFunction: mockedInstance.getTotalDepositedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDepositedAmount',
            serviceFunction: () => escrowService.getDepositedAmount('0x123'),
            expectedMockedFunction: mockedInstance.getDepositedAmount,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'getLockedAmount',
            serviceFunction: () => escrowService.getLockedAmount(),
            expectedMockedFunction: mockedInstance.getLockedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getReleasableAmount',
            serviceFunction: () => escrowService.getReleasableAmount(),
            expectedMockedFunction: mockedInstance.getReleasableAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getReleasedAmount',
            serviceFunction: () => escrowService.getReleasedAmount(),
            expectedMockedFunction: mockedInstance.getReleasedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getTotalRefundableAmount',
            serviceFunction: () => escrowService.getTotalRefundableAmount(),
            expectedMockedFunction: mockedInstance.getTotalRefundableAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getRefundedAmount',
            serviceFunction: () => escrowService.getRefundedAmount('0x123'),
            expectedMockedFunction: mockedInstance.getRefundedAmount,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'getTotalRefundedAmount',
            serviceFunction: () => escrowService.getTotalRefundedAmount(),
            expectedMockedFunction: mockedInstance.getTotalRefundedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getBalance',
            serviceFunction: () => escrowService.getBalance(),
            expectedMockedFunction: mockedInstance.getBalance,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getWithdrawableAmount',
            serviceFunction: () => escrowService.getWithdrawableAmount('0x123'),
            expectedMockedFunction: mockedInstance.getWithdrawableAmount,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'getRefundableAmount',
            serviceFunction: () => escrowService.getRefundableAmount(10, '0x123'),
            expectedMockedFunction: mockedInstance.getRefundableAmount,
            expectedMockedFunctionArgs: [10, '0x123']
        },
        {
            serviceFunctionName: 'updateFeeRecipient',
            serviceFunction: () => escrowService.updateFeeRecipient('0x123'),
            expectedMockedFunction: mockedInstance.updateFeeRecipient,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'updateBaseFee',
            serviceFunction: () => escrowService.updateBaseFee(1),
            expectedMockedFunction: mockedInstance.updateBaseFee,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updatePercentageFee',
            serviceFunction: () => escrowService.updatePercentageFee(1),
            expectedMockedFunction: mockedInstance.updatePercentageFee,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'isExpired',
            serviceFunction: () => escrowService.isExpired(),
            expectedMockedFunction: mockedInstance.isExpired,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'lockFunds',
            serviceFunction: () => escrowService.lockFunds(1),
            expectedMockedFunction: mockedInstance.lockFunds,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'releaseFunds',
            serviceFunction: () => escrowService.releaseFunds(1),
            expectedMockedFunction: mockedInstance.releaseFunds,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'refundFunds',
            serviceFunction: () => escrowService.refundFunds(1),
            expectedMockedFunction: mockedInstance.refundFunds,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'deposit',
            serviceFunction: () => escrowService.deposit(depositAmount, '0x123'),
            expectedMockedFunction: mockedInstance.deposit,
            expectedMockedFunctionArgs: [depositAmount, '0x123']
        },
        {
            serviceFunctionName: 'withdraw',
            serviceFunction: () => escrowService.withdraw(depositAmount),
            expectedMockedFunction: mockedInstance.withdraw,
            expectedMockedFunctionArgs: [depositAmount]
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => escrowService.addAdmin('0x123'),
            expectedMockedFunction: mockedInstance.addAdmin,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => escrowService.removeAdmin('0x123'),
            expectedMockedFunction: mockedInstance.removeAdmin,
            expectedMockedFunctionArgs: ['0x123']
        },
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
