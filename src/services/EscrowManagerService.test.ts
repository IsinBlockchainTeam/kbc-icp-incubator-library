import { createMock } from 'ts-auto-mock';
import { EscrowManagerService } from './EscrowManagerService';
import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';
import { Escrow } from '../entities/Escrow';
import { EscrowStatus } from '../types/EscrowStatus';

describe('EscrowManagerService', () => {
    let escrowManagerService: EscrowManagerService;

    let mockedEscrowManagerDriver: EscrowManagerDriver;
    const mockedInstance = {
        getEscrowCounter: jest.fn(),
        registerEscrow: jest.fn(),
        getFeeRecipient: jest.fn(),
        getBaseFee: jest.fn(),
        getPercentageFee: jest.fn(),
        getEscrow: jest.fn(),
        updateFeeRecipient: jest.fn(),
        updateBaseFee: jest.fn(),
        updatePercentageFee: jest.fn(),
    };

    const escrow = new Escrow(
        'payee',
        1000,
        100,
        'tokenAddress',
        EscrowStatus.ACTIVE,
        'feeRecipient',
        0,
        20,
    );

    beforeAll(() => {
        mockedEscrowManagerDriver = createMock<EscrowManagerDriver>(mockedInstance);

        escrowManagerService = new EscrowManagerService(mockedEscrowManagerDriver);
    });

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerEscrow',
            serviceFunction: () =>
                escrowManagerService.registerEscrow(
                    escrow.payee,
                    escrow.duration,
                    escrow.tokenAddress
                ),
            expectedMockedFunction: mockedInstance.registerEscrow,
            expectedMockedFunctionArgs: [
                escrow.payee,
                escrow.duration,
                escrow.tokenAddress
            ]
        },
        {
            serviceFunctionName: 'getFeeRecipient',
            serviceFunction: () => escrowManagerService.getFeeRecipient(),
            expectedMockedFunction: mockedInstance.getFeeRecipient,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updateFeeRecipient',
            serviceFunction: () => escrowManagerService.updateFeeRecipient(escrow.feeRecipient),
            expectedMockedFunction: mockedInstance.updateFeeRecipient,
            expectedMockedFunctionArgs: [escrow.feeRecipient]
        },
        {
            serviceFunctionName: 'getBaseFee',
            serviceFunction: () => escrowManagerService.getBaseFee(),
            expectedMockedFunction: mockedInstance.getBaseFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updateBaseFee',
            serviceFunction: () => escrowManagerService.updateBaseFee(escrow.baseFee),
            expectedMockedFunction: mockedInstance.updateBaseFee,
            expectedMockedFunctionArgs: [escrow.baseFee]
        },
        {
            serviceFunctionName: 'getPercentageFee',
            serviceFunction: () => escrowManagerService.getPercentageFee(),
            expectedMockedFunction: mockedInstance.getPercentageFee,
            expectedMockedFunctionArgs: []
        },
        {
            serviceFunctionName: 'updatePercentageFee',
            serviceFunction: () => escrowManagerService.updatePercentageFee(escrow.percentageFee),
            expectedMockedFunction: mockedInstance.updatePercentageFee,
            expectedMockedFunctionArgs: [escrow.percentageFee]
        },
        {
            serviceFunctionName: 'getEscrow',
            serviceFunction: () => escrowManagerService.getEscrow(1),
            expectedMockedFunction: mockedInstance.getEscrow,
            expectedMockedFunctionArgs: [1]
        },
        {
            serviceFunctionName: 'getEscrowCounter',
            serviceFunction: () => escrowManagerService.getEscrowCounter(),
            expectedMockedFunction: mockedInstance.getEscrowCounter,
            expectedMockedFunctionArgs: []
        }
    ])(
        'service should call driver $serviceFunctionName',
        async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
            await serviceFunction();

            expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
            expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
        }
    );
});
