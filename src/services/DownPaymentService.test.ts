import { createMock } from 'ts-auto-mock';
import { DownPaymentService } from './DownPaymentService';
import { DownPaymentDriver } from '../drivers/DownPaymentDriver';

describe('DownPaymentService', () => {
    let downPaymentService: DownPaymentService;

    let mockedDownPaymentDriver: DownPaymentDriver;
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
        removeAdmin: jest.fn()
    };

    const depositAmount = 10;

    beforeAll(() => {
        mockedDownPaymentDriver = createMock<DownPaymentDriver>(mockedInstance);

        downPaymentService = new DownPaymentService(mockedDownPaymentDriver);
    });

    afterAll(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'getOwner',
            serviceFunction: () => downPaymentService.getOwner(),
            expectedMockedFunction: mockedInstance.getOwner,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getPayee',
            serviceFunction: () => downPaymentService.getPayee(),
            expectedMockedFunction: mockedInstance.getPayee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getPayers',
            serviceFunction: () => downPaymentService.getPayers(),
            expectedMockedFunction: mockedInstance.getPayers,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDeployedAt',
            serviceFunction: () => downPaymentService.getDeployedAt(),
            expectedMockedFunction: mockedInstance.getDeployedAt,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDuration',
            serviceFunction: () => downPaymentService.getDuration(),
            expectedMockedFunction: mockedInstance.getDuration,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDeadline',
            serviceFunction: () => downPaymentService.getDeadline(),
            expectedMockedFunction: mockedInstance.getDeadline,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getTokenAddress',
            serviceFunction: () => downPaymentService.getTokenAddress(),
            expectedMockedFunction: mockedInstance.getTokenAddress,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getFeeRecipient',
            serviceFunction: () => downPaymentService.getFeeRecipient(),
            expectedMockedFunction: mockedInstance.getFeeRecipient,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getBaseFee',
            serviceFunction: () => downPaymentService.getBaseFee(),
            expectedMockedFunction: mockedInstance.getBaseFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getPercentageFee',
            serviceFunction: () => downPaymentService.getPercentageFee(),
            expectedMockedFunction: mockedInstance.getPercentageFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getFees',
            serviceFunction: () => downPaymentService.getFees(10),
            expectedMockedFunction: mockedInstance.getFees,
            expectedMockedFunctionArgs: [10]
        },
        {
            serviceFunctionName: 'getTotalDepositedAmount',
            serviceFunction: () => downPaymentService.getTotalDepositedAmount(),
            expectedMockedFunction: mockedInstance.getTotalDepositedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getDepositedAmount',
            serviceFunction: () => downPaymentService.getDepositedAmount('0x123'),
            expectedMockedFunction: mockedInstance.getDepositedAmount,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'getLockedAmount',
            serviceFunction: () => downPaymentService.getLockedAmount(),
            expectedMockedFunction: mockedInstance.getLockedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getReleasableAmount',
            serviceFunction: () => downPaymentService.getReleasableAmount(),
            expectedMockedFunction: mockedInstance.getReleasableAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getReleasedAmount',
            serviceFunction: () => downPaymentService.getReleasedAmount(),
            expectedMockedFunction: mockedInstance.getReleasedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getTotalRefundableAmount',
            serviceFunction: () => downPaymentService.getTotalRefundableAmount(),
            expectedMockedFunction: mockedInstance.getTotalRefundableAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getRefundedAmount',
            serviceFunction: () => downPaymentService.getRefundedAmount('0x123'),
            expectedMockedFunction: mockedInstance.getRefundedAmount,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'getTotalRefundedAmount',
            serviceFunction: () => downPaymentService.getTotalRefundedAmount(),
            expectedMockedFunction: mockedInstance.getTotalRefundedAmount,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getBalance',
            serviceFunction: () => downPaymentService.getBalance(),
            expectedMockedFunction: mockedInstance.getBalance,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'getWithdrawableAmount',
            serviceFunction: () => downPaymentService.getWithdrawableAmount('0x123'),
            expectedMockedFunction: mockedInstance.getWithdrawableAmount,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'getRefundableAmount',
            serviceFunction: () => downPaymentService.getRefundableAmount(10, '0x123'),
            expectedMockedFunction: mockedInstance.getRefundableAmount,
            expectedMockedFunctionArgs: [10, '0x123']
        },
        {
            serviceFunctionName: 'updateFeeRecipient',
            serviceFunction: () => downPaymentService.updateFeeRecipient('0x123'),
            expectedMockedFunction: mockedInstance.updateFeeRecipient,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'updateBaseFee',
            serviceFunction: () => downPaymentService.updateBaseFee(1),
            expectedMockedFunction: mockedInstance.updateBaseFee,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'updatePercentageFee',
            serviceFunction: () => downPaymentService.updatePercentageFee(1),
            expectedMockedFunction: mockedInstance.updatePercentageFee,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'isExpired',
            serviceFunction: () => downPaymentService.isExpired(),
            expectedMockedFunction: mockedInstance.isExpired,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'lockFunds',
            serviceFunction: () => downPaymentService.lockFunds(1),
            expectedMockedFunction: mockedInstance.lockFunds,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'releaseFunds',
            serviceFunction: () => downPaymentService.releaseFunds(1),
            expectedMockedFunction: mockedInstance.releaseFunds,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'refundFunds',
            serviceFunction: () => downPaymentService.refundFunds(1),
            expectedMockedFunction: mockedInstance.refundFunds,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'deposit',
            serviceFunction: () => downPaymentService.deposit(depositAmount, '0x123'),
            expectedMockedFunction: mockedInstance.deposit,
            expectedMockedFunctionArgs: [depositAmount, '0x123']
        },
        {
            serviceFunctionName: 'withdraw',
            serviceFunction: () => downPaymentService.withdraw(depositAmount),
            expectedMockedFunction: mockedInstance.withdraw,
            expectedMockedFunctionArgs: [depositAmount]
        },
        {
            serviceFunctionName: 'addAdmin',
            serviceFunction: () => downPaymentService.addAdmin('0x123'),
            expectedMockedFunction: mockedInstance.addAdmin,
            expectedMockedFunctionArgs: ['0x123']
        },
        {
            serviceFunctionName: 'removeAdmin',
            serviceFunction: () => downPaymentService.removeAdmin('0x123'),
            expectedMockedFunction: mockedInstance.removeAdmin,
            expectedMockedFunctionArgs: ['0x123']
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
