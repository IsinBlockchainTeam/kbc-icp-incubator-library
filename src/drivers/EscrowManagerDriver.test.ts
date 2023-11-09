import { Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import {EscrowManagerDriver} from "./EscrowManagerDriver";
import { EntityBuilder } from '../utils/EntityBuilder';
import { EscrowManager, EscrowManager__factory } from "../smart-contracts";
import {Escrow} from "../entities/Escrow";

describe('EscrowManagerDriver', () => {
    let escrowManagerDriver: EscrowManagerDriver;
    const payee: string = Wallet.createRandom().address;
    const payer: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedEscrowManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetEscrow = jest.fn();
    const mockedGetPayees = jest.fn();

    const mockedEscrow = createMock<Escrow>();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetEscrow.mockReturnValue(Promise.resolve(JSON.stringify({
        payee: payee,
        payer: payer,
        deployedAt: 1,
        duration: 1,
        tokenAddress: contractAddress,
        state: 1,
    })));
    mockedGetPayees.mockReturnValue(Promise.resolve([payee]));

    const mockedContract = createMock<EscrowManager>({
        registerEscrow: mockedWriteFunction,
        getEscrow: mockedGetEscrow,
        getPayees: mockedGetPayees,
    });

    beforeAll(() => {mockedEscrowManagerConnect.mockReturnValue(mockedContract);
        const mockedEscrowManager = createMock<EscrowManager>({
            connect: mockedEscrowManagerConnect,
        });
        jest.spyOn(EscrowManager__factory, 'connect').mockReturnValue(mockedEscrowManager);
        const buildEscrowManagerSpy = jest.spyOn(EntityBuilder, 'buildEscrow');
        buildEscrowManagerSpy.mockReturnValue(mockedEscrow);

        mockedSigner = createMock<Signer>();
        escrowManagerDriver = new EscrowManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly register a new Escrow', async () => {
        await escrowManagerDriver.registerEscrow(payee, payer, 1, contractAddress);

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerEscrow).toHaveBeenNthCalledWith(1, payee, payer, 1, contractAddress);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new Escrow - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.registerEscrow('notAnAddress', payer, 1, contractAddress)).rejects.toThrowError(new Error('Not an address'));

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0)
    });

    it('should correctly retrieve an Escrow', async () => {
        const response = await escrowManagerDriver.getEscrow(1);

        expect(response).toEqual(mockedEscrow);

        expect(mockedContract.getEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrow).toHaveBeenNthCalledWith(1, 1);
        expect(mockedGetEscrow).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve payees', async () => {
        const response = await escrowManagerDriver.getPayees(payer);

        expect(response).toEqual([payee]);

        expect(mockedContract.getPayees).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayees).toHaveBeenNthCalledWith(1, payer);
        expect(mockedGetPayees).toHaveBeenCalledTimes(1);
    });
});