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
        getCommissioner: jest.fn(),
        updateCommissioner: jest.fn(),
        getEscrow: jest.fn(),
        getEscrowsId: jest.fn(),
    };

    const escrow = new Escrow("payee", "purchaser", ["purchaser", "delegate"], 1000, 100, EscrowStatus.ACTIVE, 0, "tokenAddress", "commissioner", 20, 1);

    beforeAll(() => {
        mockedEscrowManagerDriver = createMock<EscrowManagerDriver>(mockedInstance);

        escrowManagerService = new EscrowManagerService(mockedEscrowManagerDriver);
    })

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerEscrow',
            serviceFunction: () => escrowManagerService.registerEscrow(escrow.payee, escrow.purchaser, escrow.agreedAmount, escrow.duration, escrow.tokenAddress, escrow.baseFee, escrow.percentageFee),
            expectedMockedFunction: mockedInstance.registerEscrow,
            expectedMockedFunctionArgs: [escrow.payee, escrow.purchaser, escrow.agreedAmount, escrow.duration, escrow.tokenAddress, escrow.baseFee, escrow.percentageFee],
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
            serviceFunctionName: 'getEscrow',
            serviceFunction: () => escrowManagerService.getEscrow(1),
            expectedMockedFunction: mockedInstance.getEscrow,
            expectedMockedFunctionArgs: [1],
        },
        {
            serviceFunctionName: 'getEscrowsId',
            serviceFunction: () => escrowManagerService.getEscrowsId(escrow.purchaser),
            expectedMockedFunction: mockedInstance.getEscrowsId,
            expectedMockedFunctionArgs: [escrow.purchaser],
        },
    ])('service should call driver $serviceFunctionName', async ({ serviceFunction, expectedMockedFunction, expectedMockedFunctionArgs }) => {
        await serviceFunction();

        expect(expectedMockedFunction).toHaveBeenCalledTimes(1);
        expect(expectedMockedFunction).toHaveBeenCalledWith(...expectedMockedFunctionArgs);
    });
});