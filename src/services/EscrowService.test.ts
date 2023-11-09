import { createMock } from 'ts-auto-mock';
import { EscrowService } from './EscrowService';
import { EscrowDriver } from '../drivers/EscrowDriver';

describe('EscrowService', () => {
    let escrowService: EscrowService;

    let mockedEscrowDriver: EscrowDriver;
    const mockedInstance = {
        getPayee: jest.fn(),
        getPayer: jest.fn(),
        getDeployedAt: jest.fn(),
        getDuration: jest.fn(),
        getState: jest.fn(),
        getDepositAmount: jest.fn(),
        getTokenAddress: jest.fn(),
        getDeadline: jest.fn(),
        hasExpired: jest.fn(),
        withdrawalAllowed: jest.fn(),
        refundAllowed: jest.fn(),
        deposit: jest.fn(),
        close: jest.fn(),
        enableRefund: jest.fn(),
        enableRefundForExpiredEscrow: jest.fn(),
        withdraw: jest.fn(),
        refund: jest.fn(),
    };

    const depositAmount = 10;

    beforeAll(() => {
        mockedEscrowDriver = createMock<EscrowDriver>(mockedInstance);

        escrowService = new EscrowService(mockedEscrowDriver);
    });

    afterAll(() => jest.clearAllMocks());

    it.each([
        {
            serviceFunctionName: 'getPayee',
            serviceFunction: () => escrowService.getPayee(),
            expectedMockedFunction: mockedInstance.getPayee,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getPayer',
            serviceFunction: () => escrowService.getPayer(),
            expectedMockedFunction: mockedInstance.getPayer,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getDeployedAt',
            serviceFunction: () => escrowService.getDeployedAt(),
            expectedMockedFunction: mockedInstance.getDeployedAt,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getDuration',
            serviceFunction: () => escrowService.getDuration(),
            expectedMockedFunction: mockedInstance.getDuration,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getState',
            serviceFunction: () => escrowService.getState(),
            expectedMockedFunction: mockedInstance.getState,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getDepositAmount',
            serviceFunction: () => escrowService.getDepositAmount(),
            expectedMockedFunction: mockedInstance.getDepositAmount,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getTokenAddress',
            serviceFunction: () => escrowService.getTokenAddress(),
            expectedMockedFunction: mockedInstance.getTokenAddress,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getDeadline',
            serviceFunction: () => escrowService.getDeadline(),
            expectedMockedFunction: mockedInstance.getDeadline,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'hasExpired',
            serviceFunction: () => escrowService.hasExpired(),
            expectedMockedFunction: mockedInstance.hasExpired,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'withdrawalAllowed',
            serviceFunction: () => escrowService.withdrawalAllowed(),
            expectedMockedFunction: mockedInstance.withdrawalAllowed,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'refundAllowed',
            serviceFunction: () => escrowService.refundAllowed(),
            expectedMockedFunction: mockedInstance.refundAllowed,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'deposit',
            serviceFunction: () => escrowService.deposit(depositAmount),
            expectedMockedFunction: mockedInstance.deposit,
            expectedMockedFunctionArgs: [depositAmount],
        },
        {
            serviceFunctionName: 'close',
            serviceFunction: () => escrowService.close(),
            expectedMockedFunction: mockedInstance.close,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'enableRefund',
            serviceFunction: () => escrowService.enableRefund(),
            expectedMockedFunction: mockedInstance.enableRefund,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'enableRefundForExpiredEscrow',
            serviceFunction: () => escrowService.enableRefundForExpiredEscrow(),
            expectedMockedFunction: mockedInstance.enableRefundForExpiredEscrow,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'withdraw',
            serviceFunction: () => escrowService.withdraw(),
            expectedMockedFunction: mockedInstance.withdraw,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'refund',
            serviceFunction: () => escrowService.refund(),
            expectedMockedFunction: mockedInstance.refund,
            expectedMockedFunctionArgs: [],
        }

    ])('should call driver $serviceFunctionName', async ({serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs}) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});