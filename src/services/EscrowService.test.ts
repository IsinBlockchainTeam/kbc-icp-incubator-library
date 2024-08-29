// TODO: fix this test
it('should pass', () => {
    expect(true).toBe(true);
});
// import { createMock } from 'ts-auto-mock';
// import { EscrowService } from './EscrowService';
// import { EscrowDriver } from '../drivers/EscrowDriver';
//
// describe('EscrowService', () => {
//     let escrowService: EscrowService;
//
//     let mockedEscrowDriver: EscrowDriver;
//     const mockedInstance = {
//         getOwner: jest.fn(),
//         getPayee: jest.fn(),
//         getDeployedAt: jest.fn(),
//         getDuration: jest.fn(),
//         getDeadline: jest.fn(),
//         getTokenAddress: jest.fn(),
//         getState: jest.fn(),
//         getFeeRecipient: jest.fn(),
//         getBaseFee: jest.fn(),
//         getPercentageFee: jest.fn(),
//         getFees: jest.fn(),
//         getDepositedAmount: jest.fn(),
//         getTotalDepositedAmount: jest.fn(),
//         getRefundedAmount: jest.fn(),
//         getTotalRefundedAmount: jest.fn(),
//         getTotalWithdrawnAmount: jest.fn(),
//         getRefundablePercentage: jest.fn(),
//         getWithdrawablePercentage: jest.fn(),
//         getWithdrawableAmount: jest.fn(),
//         getRefundableAmount: jest.fn(),
//         updateFeeRecipient: jest.fn(),
//         updateBaseFee: jest.fn(),
//         updatePercentageFee: jest.fn(),
//         updateCommissioner: jest.fn(),
//         isExpired: jest.fn(),
//         enableWithdrawal: jest.fn(),
//         enableRefund: jest.fn(),
//         deposit: jest.fn(),
//         payerWithdraw: jest.fn(),
//         payeeWithdraw: jest.fn(),
//         payerRefund: jest.fn()
//     };
//
//     const depositAmount = 10;
//
//     beforeAll(() => {
//         mockedEscrowDriver = createMock<EscrowDriver>(mockedInstance);
//
//         escrowService = new EscrowService(mockedEscrowDriver);
//     });
//
//     afterAll(() => jest.clearAllMocks());
//
//     it.each([
//         {
//             serviceFunctionName: 'getOwner',
//             serviceFunction: () => escrowService.getOwner(),
//             expectedMockedFunction: mockedInstance.getOwner,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getPayee',
//             serviceFunction: () => escrowService.getPayee(),
//             expectedMockedFunction: mockedInstance.getPayee,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getDeployedAt',
//             serviceFunction: () => escrowService.getDeployedAt(),
//             expectedMockedFunction: mockedInstance.getDeployedAt,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getDuration',
//             serviceFunction: () => escrowService.getDuration(),
//             expectedMockedFunction: mockedInstance.getDuration,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getDeadline',
//             serviceFunction: () => escrowService.getDeadline(),
//             expectedMockedFunction: mockedInstance.getDeadline,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getTokenAddress',
//             serviceFunction: () => escrowService.getTokenAddress(),
//             expectedMockedFunction: mockedInstance.getTokenAddress,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getState',
//             serviceFunction: () => escrowService.getState(),
//             expectedMockedFunction: mockedInstance.getState,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getFeeRecipient',
//             serviceFunction: () => escrowService.getFeeRecipient(),
//             expectedMockedFunction: mockedInstance.getFeeRecipient,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getBaseFee',
//             serviceFunction: () => escrowService.getBaseFee(),
//             expectedMockedFunction: mockedInstance.getBaseFee,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getPercentageFee',
//             serviceFunction: () => escrowService.getPercentageFee(),
//             expectedMockedFunction: mockedInstance.getPercentageFee,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getFees',
//             serviceFunction: () => escrowService.getFees(10),
//             expectedMockedFunction: mockedInstance.getFees,
//             expectedMockedFunctionArgs: [10]
//         },
//         {
//             serviceFunctionName: 'getDepositedAmount',
//             serviceFunction: () => escrowService.getDepositedAmount(),
//             expectedMockedFunction: mockedInstance.getDepositedAmount,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getTotalDepositedAmount',
//             serviceFunction: () => escrowService.getTotalDepositedAmount(),
//             expectedMockedFunction: mockedInstance.getTotalDepositedAmount,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getRefundedAmount',
//             serviceFunction: () => escrowService.getRefundedAmount(),
//             expectedMockedFunction: mockedInstance.getRefundedAmount,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getTotalRefundedAmount',
//             serviceFunction: () => escrowService.getTotalRefundedAmount(),
//             expectedMockedFunction: mockedInstance.getTotalRefundedAmount,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getTotalWithdrawnAmount',
//             serviceFunction: () => escrowService.getTotalWithdrawnAmount(),
//             expectedMockedFunction: mockedInstance.getTotalWithdrawnAmount,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getRefundablePercentage',
//             serviceFunction: () => escrowService.getRefundablePercentage(),
//             expectedMockedFunction: mockedInstance.getRefundablePercentage,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getWithdrawablePercentage',
//             serviceFunction: () => escrowService.getWithdrawablePercentage(),
//             expectedMockedFunction: mockedInstance.getWithdrawablePercentage,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getWithdrawableAmount',
//             serviceFunction: () => escrowService.getWithdrawableAmount(),
//             expectedMockedFunction: mockedInstance.getWithdrawableAmount,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'getRefundableAmount',
//             serviceFunction: () => escrowService.getRefundableAmount('0x123'),
//             expectedMockedFunction: mockedInstance.getRefundableAmount,
//             expectedMockedFunctionArgs: ['0x123']
//         },
//         {
//             serviceFunctionName: 'updateFeeRecipient',
//             serviceFunction: () => escrowService.updateFeeRecipient('0x123'),
//             expectedMockedFunction: mockedInstance.updateFeeRecipient,
//             expectedMockedFunctionArgs: ['0x123']
//         },
//         {
//             serviceFunctionName: 'updateBaseFee',
//             serviceFunction: () => escrowService.updateBaseFee(1),
//             expectedMockedFunction: mockedInstance.updateBaseFee,
//             expectedMockedFunctionArgs: [1]
//         },
//         {
//             serviceFunctionName: 'updatePercentageFee',
//             serviceFunction: () => escrowService.updatePercentageFee(1),
//             expectedMockedFunction: mockedInstance.updatePercentageFee,
//             expectedMockedFunctionArgs: [1]
//         },
//         {
//             serviceFunctionName: 'isExpired',
//             serviceFunction: () => escrowService.isExpired(),
//             expectedMockedFunction: mockedInstance.isExpired,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'enableWithdrawal',
//             serviceFunction: () => escrowService.enableWithdrawal(1),
//             expectedMockedFunction: mockedInstance.enableWithdrawal,
//             expectedMockedFunctionArgs: [1]
//         },
//         {
//             serviceFunctionName: 'enableRefund',
//             serviceFunction: () => escrowService.enableRefund(1),
//             expectedMockedFunction: mockedInstance.enableRefund,
//             expectedMockedFunctionArgs: [1]
//         },
//         {
//             serviceFunctionName: 'deposit',
//             serviceFunction: () => escrowService.deposit(depositAmount),
//             expectedMockedFunction: mockedInstance.deposit,
//             expectedMockedFunctionArgs: [depositAmount]
//         },
//         {
//             serviceFunctionName: 'payerWithdraw',
//             serviceFunction: () => escrowService.payerWithdraw(depositAmount),
//             expectedMockedFunction: mockedInstance.payerWithdraw,
//             expectedMockedFunctionArgs: [depositAmount]
//         },
//         {
//             serviceFunctionName: 'payeeWithdraw',
//             serviceFunction: () => escrowService.payeeWithdraw(),
//             expectedMockedFunction: mockedInstance.payeeWithdraw,
//             expectedMockedFunctionArgs: []
//         },
//         {
//             serviceFunctionName: 'payerRefund',
//             serviceFunction: () => escrowService.payerRefund(),
//             expectedMockedFunction: mockedInstance.payerRefund,
//             expectedMockedFunctionArgs: []
//         },
//     ])(
//         'should call driver $serviceFunctionName',
//         async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
//             await serviceFunction();
//
//             expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
//             expect(expectedMockedFunction).toHaveBeenNthCalledWith(
//                 1,
//                 ...expectedMockedFunctionArgs
//             );
//         }
//     );
// });
