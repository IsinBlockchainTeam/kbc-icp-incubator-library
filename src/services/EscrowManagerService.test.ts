import {createMock} from 'ts-auto-mock';
import {EscrowManagerService} from "./EscrowManagerService";
import {EscrowManagerDriver} from "../drivers/EscrowManagerDriver";
import {Escrow} from "../entities/Escrow";
import {Escrow as EscrowContract} from "../smart-contracts";
import {EscrowStatus} from "../types/EscrowStatus";
import {BigNumber} from "ethers";

describe('EscrowManagerService', () => {
    let escrowManagerService: EscrowManagerService;

    let mockedEscrowManagerDriver: EscrowManagerDriver;
    const mockedInstance = {
        registerEscrow: jest.fn(),
        getEscrow: jest.fn(),
        getEscrowsId: jest.fn(),
    };
    const payers: EscrowContract.PayersStructOutput[] = [{
        payerAddress: 'payer',
        depositedAmount: BigNumber.from(0),
    }] as EscrowContract.PayersStructOutput[];

    const escrow = new Escrow("payee", "purchaser", payers, 1000, 100, EscrowStatus.ACTIVE, 0, "tokenAddress");

    beforeAll(() => {
        mockedEscrowManagerDriver = createMock<EscrowManagerDriver>(mockedInstance);

        escrowManagerService = new EscrowManagerService(mockedEscrowManagerDriver);
    })

    afterAll(() => jest.restoreAllMocks());

    it.each([
        {
            serviceFunctionName: 'registerEscrow',
            serviceFunction: () => escrowManagerService.registerEscrow(escrow.payee, escrow.purchaser, escrow.agreedAmount, escrow.duration, escrow.tokenAddress),
            expectedMockedFunction: mockedInstance.registerEscrow,
            expectedMockedFunctionArgs: [escrow.payee, escrow.purchaser, escrow.agreedAmount, escrow.duration, escrow.tokenAddress],
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