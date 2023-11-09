import {createMock} from 'ts-auto-mock';
import {EscrowManagerService} from "./EscrowManagerService";
import {EscrowManagerDriver} from "../drivers/EscrowManagerDriver";
import {Escrow} from "../entities/Escrow";
import {EscrowStatus} from "../types/EscrowStatus";

describe('EscrowManagerService', () => {
    let escrowManagerService: EscrowManagerService;

    let mockedEscrowManagerDriver: EscrowManagerDriver;
    const mockedInstance = {
        registerEscrow: jest.fn(),
        getEscrow: jest.fn(),
        getPayees: jest.fn(),
    };

    const escrow = new Escrow("payee", "payer", 0, 100, EscrowStatus.ACTIVE, 0, "tokenAddress");

    beforeAll(() => {
        mockedEscrowManagerDriver = createMock<EscrowManagerDriver>(mockedInstance);

        escrowManagerService = new EscrowManagerService(mockedEscrowManagerDriver);
    })

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerEscrow',
            serviceFunction: () => escrowManagerService.registerEscrow(escrow.payee, escrow.payer, escrow.duration, escrow.tokenAddress),
            expectedMockedFunction: mockedInstance.registerEscrow,
            expectedMockedFunctionArgs: [escrow.payee, escrow.payer, escrow.duration, escrow.tokenAddress],
        },
        {
            serviceFunctionName: 'getEscrow',
            serviceFunction: () => escrowManagerService.getEscrow(1),
            expectedMockedFunction: mockedInstance.getEscrow,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getPayees',
            serviceFunction: () => escrowManagerService.getPayees(escrow.payer),
            expectedMockedFunction: mockedInstance.getPayees,
            expectedMockedFunctionArgs: [escrow.payer],
        },
    ])('service should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
    });
});