import { createMock } from 'ts-auto-mock';
import { EscrowManagerService } from './EscrowManagerService';
import { EscrowManagerDriver } from '../drivers/EscrowManagerDriver';
import { Escrow } from '../entities/Escrow';
import { EscrowStatus } from '../types/EscrowStatus';

describe('EscrowManagerService', () => {
    let escrowManagerService: EscrowManagerService;

    let mockedEscrowManagerDriver: EscrowManagerDriver;
    const mockedInstance = {
        registerEscrow: jest.fn(),
        getCommissioner: jest.fn(),
        updateCommissioner: jest.fn(),
        getBaseFee: jest.fn(),
        updateBaseFee: jest.fn(),
        getPercentageFee: jest.fn(),
        updatePercentageFee: jest.fn(),
        getEscrow: jest.fn(),
        getEscrowIdsOfPurchaser: jest.fn(),
    };

    const escrow = new Escrow('payee', 'purchaser', ['purchaser', 'delegate'], 1000, 100, EscrowStatus.ACTIVE, 0, 'tokenAddress', 'commissioner', 20, 1);

    beforeAll(() => {
        mockedEscrowManagerDriver = createMock<EscrowManagerDriver>(mockedInstance);

        escrowManagerService = new EscrowManagerService(mockedEscrowManagerDriver);
    });

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerEscrow',
            serviceFunction: () => escrowManagerService.registerEscrow(escrow.payee, escrow.purchaser, escrow.agreedAmount, escrow.duration, escrow.tokenAddress),
            expectedMockedFunction: mockedInstance.registerEscrow,
            expectedMockedFunctionArgs: [escrow.payee, escrow.purchaser, escrow.agreedAmount, escrow.duration, escrow.tokenAddress],
        },
        {
            serviceFunctionName: 'getCommissioner',
            serviceFunction: () => escrowManagerService.getCommissioner(),
            expectedMockedFunction: mockedInstance.getCommissioner,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'updateCommissioner',
            serviceFunction: () => escrowManagerService.updateCommissioner(escrow.commissioner),
            expectedMockedFunction: mockedInstance.updateCommissioner,
            expectedMockedFunctionArgs: [escrow.commissioner],
        },
        {
            serviceFunctionName: 'getBaseFee',
            serviceFunction: () => escrowManagerService.getBaseFee(),
            expectedMockedFunction: mockedInstance.getBaseFee,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'updateBaseFee',
            serviceFunction: () => escrowManagerService.updateBaseFee(escrow.baseFee),
            expectedMockedFunction: mockedInstance.updateBaseFee,
            expectedMockedFunctionArgs: [escrow.baseFee],
        },
        {
            serviceFunctionName: 'getPercentageFee',
            serviceFunction: () => escrowManagerService.getPercentageFee(),
            expectedMockedFunction: mockedInstance.getPercentageFee,
            expectedMockedFunctionArgs: [],
        },
        {
            serviceFunctionName: 'updatePercentageFee',
            serviceFunction: () => escrowManagerService.updatePercentageFee(escrow.percentageFee),
            expectedMockedFunction: mockedInstance.updatePercentageFee,
            expectedMockedFunctionArgs: [escrow.percentageFee],
        },
        {
            serviceFunctionName: 'getEscrow',
            serviceFunction: () => escrowManagerService.getEscrow(1),
            expectedMockedFunction: mockedInstance.getEscrow,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getEscrowIdsOfPurchaser',
            serviceFunction: () => escrowManagerService.getEscrowIdsOfPurchaser(escrow.purchaser),
            expectedMockedFunction: mockedInstance.getEscrowIdsOfPurchaser,
            expectedMockedFunctionArgs: [escrow.purchaser],
        },
    ])('service should call driver $serviceFunctionName', async ({
        serviceFunction,
        expectedMockedFunction,
        expectedMockedFunctionArgs,
    }) => {
        await serviceFunction();

        expect(expectedMockedFunction)
            .toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction)
            .toHaveBeenCalledWith(...expectedMockedFunctionArgs);
    });
});
