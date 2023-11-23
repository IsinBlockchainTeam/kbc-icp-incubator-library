import {BigNumber, Signer, Wallet} from 'ethers';
import { createMock } from 'ts-auto-mock';
import {EscrowManagerDriver} from "./EscrowManagerDriver";
import { EntityBuilder } from '../utils/EntityBuilder';
import { EscrowManager, EscrowManager__factory, Escrow as EscrowContract } from "../smart-contracts";
import {Escrow} from "../entities/Escrow";
import {EscrowStatus} from "../types/EscrowStatus";

describe('EscrowManagerDriver', () => {
    let escrowManagerDriver: EscrowManagerDriver;
    const payee: string = Wallet.createRandom().address;
    const purchaser: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedEscrowManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetCommissioner = jest.fn();
    const mockedGetEscrow = jest.fn();
    const mockedGetEscrowsId = jest.fn();

    const mockedEscrow = createMock<Escrow>();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetCommissioner.mockReturnValue(Promise.resolve(commissioner));
    mockedGetEscrow.mockReturnValue(Promise.resolve(JSON.stringify({
        payee: 'payee',
        purchaser: 'purchaser',
        payers: [{
            payerAddress: 'payer',
            depositedAmount: BigNumber.from(0),
        }] as EscrowContract.PayersStructOutput[],
        agreedAmount: BigNumber.from(1000),
        deployedAt: BigNumber.from(0),
        duration: BigNumber.from(100),
        status: EscrowStatus.ACTIVE,
        tokenAddress: 'tokenAddress',
    })));
    mockedGetEscrowsId.mockReturnValue(Promise.resolve([BigNumber.from(0)]));

    const mockedContract = createMock<EscrowManager>({
        registerEscrow: mockedWriteFunction,
        getCommissioner: mockedGetCommissioner,
        updateCommissioner: mockedWriteFunction,
        getEscrow: mockedGetEscrow,
        getEscrowsId: mockedGetEscrowsId,
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
        await escrowManagerDriver.registerEscrow(payee, purchaser, 1000,1, contractAddress);

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerEscrow).toHaveBeenNthCalledWith(1, payee, purchaser, 1000, 1, contractAddress);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new Escrow - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.registerEscrow('notAnAddress', purchaser, 1000, 1, contractAddress)).rejects.toThrowError(new Error('Not an address'));

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0)
    });

    it('should correctly retrieve commissioner', async () => {
        const response = await escrowManagerDriver.getCommissioner();

        expect(response).toEqual(commissioner);

        expect(mockedContract.getCommissioner).toHaveBeenCalledTimes(1);
        expect(mockedContract.getCommissioner).toHaveBeenNthCalledWith(1);
        expect(mockedGetCommissioner).toHaveBeenCalledTimes(1);
    });

    it('should correctly update commissioner', async () => {
        await escrowManagerDriver.updateCommissioner(payee);

        expect(mockedContract.updateCommissioner).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateCommissioner).toHaveBeenNthCalledWith(1, payee);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly update commissioner - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.updateCommissioner('notAnAddress')).rejects.toThrowError(new Error('Not an address'));

        expect(mockedContract.updateCommissioner).toHaveBeenCalledTimes(0);
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
        const response = await escrowManagerDriver.getEscrowsId(purchaser);

        expect(response).toEqual([0]);

        expect(mockedContract.getEscrowsId).toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrowsId).toHaveBeenNthCalledWith(1, purchaser);
        expect(mockedGetEscrowsId).toHaveBeenCalledTimes(1);
    });
});