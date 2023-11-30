import {BigNumber, Signer, Wallet} from 'ethers';
import { createMock } from 'ts-auto-mock';
import {EscrowManagerDriver} from "./EscrowManagerDriver";
import { EscrowManager, EscrowManager__factory } from "../smart-contracts";

describe('EscrowManagerDriver', () => {
    let escrowManagerDriver: EscrowManagerDriver;
    const payee: string = Wallet.createRandom().address;
    const purchaser: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const escrowAddress: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;

    let mockedSigner: Signer;

    const mockedEscrowManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetCommissioner = jest.fn();
    const mockedGetEscrow = jest.fn();
    const mockedGetEscrowsId = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetCommissioner.mockReturnValue(Promise.resolve(commissioner));
    mockedGetEscrow.mockReturnValue(Promise.resolve(escrowAddress));
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

        mockedSigner = createMock<Signer>();
        escrowManagerDriver = new EscrowManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly register a new Escrow', async () => {
        await escrowManagerDriver.registerEscrow(payee, purchaser, 1000,1, contractAddress, 20, 1);

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerEscrow).toHaveBeenNthCalledWith(1, payee, purchaser, 1000, 1, contractAddress, 20, 1);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new Escrow - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.registerEscrow('notAnAddress', purchaser, 1000, 1, contractAddress, 20, 1)).rejects.toThrowError(new Error('Not an address'));

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

        expect(response).toEqual(escrowAddress);

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