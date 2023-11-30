import {createMock} from 'ts-auto-mock';
import {EscrowService} from './EscrowService';
import {EscrowDriver} from '../drivers/EscrowDriver';

describe('EscrowService', () => {
    let escrowService: EscrowService;

    let mockedEscrowDriver: EscrowDriver;
    const mockedInstance = {
        getPayee: jest.fn(),
        getPurchaser: jest.fn(),
        getPayers: jest.fn(),
        getAgreedAmount: jest.fn(),
        getDeployedAt: jest.fn(),
        getDuration: jest.fn(),
        getState: jest.fn(),
        getDepositAmount: jest.fn(),
        getTokenAddress: jest.fn(),
        getCommissioner: jest.fn(),
        getBaseFee: jest.fn(),
        getPercentageFee: jest.fn(),
        updateCommissioner: jest.fn(),
        getDeadline: jest.fn(),
        hasExpired: jest.fn(),
        withdrawalAllowed: jest.fn(),
        refundAllowed: jest.fn(),
        addDelegate: jest.fn(),
        removeDelegate: jest.fn(),
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
            serviceFunctionName: 'getPurchaser',
            serviceFunction: () => escrowService.getPurchaser(),
            expectedMockedFunction: mockedInstance.getPurchaser,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getPayers',
            serviceFunction: () => escrowService.getPayers(),
            expectedMockedFunction: mockedInstance.getPayers,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getAgreedAmount',
            serviceFunction: () => escrowService.getAgreedAmount(),
            expectedMockedFunction: mockedInstance.getAgreedAmount,
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
            serviceFunctionName: 'getCommissioner',
            serviceFunction: () => escrowService.getCommissioner(),
            expectedMockedFunction: mockedInstance.getCommissioner,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getBaseFee',
            serviceFunction: () => escrowService.getBaseFee(),
            expectedMockedFunction: mockedInstance.getBaseFee,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'getPercentageFee',
            serviceFunction: () => escrowService.getPercentageFee(),
            expectedMockedFunction: mockedInstance.getPercentageFee,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'updateCommissioner',
            serviceFunction: () => escrowService.updateCommissioner('0x123'),
            expectedMockedFunction: mockedInstance.updateCommissioner,
            expectedMockedFunctionArgs: ['0x123'],
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
            serviceFunctionName: 'addDelegate',
            serviceFunction: () => escrowService.addDelegate('0x123'),
            expectedMockedFunction: mockedInstance.addDelegate,
            expectedMockedFunctionArgs: ['0x123'],
        },
        {
            serviceFunctionName: 'removeDelegate',
            serviceFunction: () => escrowService.removeDelegate('0x123'),
            expectedMockedFunction: mockedInstance.removeDelegate,
            expectedMockedFunctionArgs: ['0x123'],
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

    ])('should call driver $serviceFunctionName', async ({
                                                             serviceFunction,
                                                             expectedMockedFunction,
                                                             expectedMockedFunctionArgs
                                                         }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenNthCalledWith(1, ...expectedMockedFunctionArgs);
    });
});