import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EscrowManagerDriver } from './EscrowManagerDriver';
import { EscrowManager, EscrowManager__factory } from '../smart-contracts';

describe('EscrowManagerDriver', () => {
    let escrowManagerDriver: EscrowManagerDriver;
    const payee: string = Wallet.createRandom().address;
    const purchaser: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const escrowAddress: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const baseFee: number = 20;
    const percentageFee: number = 1;

    let mockedSigner: Signer;

    const mockedEscrowManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetCommissioner = jest.fn();
    const mockedGetBaseFee = jest.fn();
    const mockedGetPercentageFee = jest.fn();
    const mockedGetEscrow = jest.fn();
    const mockedGetEscrowCounter = jest.fn();
    const mockedGetEscrowIdsOfPurchaser = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedGetCommissioner.mockReturnValue(Promise.resolve(commissioner));
    mockedGetBaseFee.mockReturnValue(Promise.resolve(BigNumber.from(baseFee)));
    mockedGetPercentageFee.mockReturnValue(Promise.resolve(BigNumber.from(percentageFee)));
    mockedGetEscrow.mockReturnValue(Promise.resolve(escrowAddress));
    mockedGetEscrowCounter.mockReturnValue(BigNumber.from(1));
    mockedGetEscrowIdsOfPurchaser.mockReturnValue(Promise.resolve([BigNumber.from(0)]));

    const mockedContract = createMock<EscrowManager>({
        registerEscrow: mockedWriteFunction,
        getCommissioner: mockedGetCommissioner,
        updateCommissioner: mockedWriteFunction,
        getBaseFee: mockedGetBaseFee,
        updateBaseFee: mockedWriteFunction,
        getPercentageFee: mockedGetPercentageFee,
        updatePercentageFee: mockedWriteFunction,
        getEscrow: mockedGetEscrow,
        getEscrowCounter: mockedGetEscrowCounter,
        getEscrowIdsOfPurchaser: mockedGetEscrowIdsOfPurchaser,
    });

    beforeAll(() => {
        mockedEscrowManagerConnect.mockReturnValue(mockedContract);
        const mockedEscrowManager = createMock<EscrowManager>({
            connect: mockedEscrowManagerConnect,
        });
        jest.spyOn(EscrowManager__factory, 'connect')
            .mockReturnValue(mockedEscrowManager);

        mockedSigner = createMock<Signer>();
        escrowManagerDriver = new EscrowManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly register a new Escrow', async () => {
        await escrowManagerDriver.registerEscrow(payee, purchaser, 1000, 1, contractAddress);

        expect(mockedContract.registerEscrow)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.registerEscrow)
            .toHaveBeenNthCalledWith(1, payee, purchaser, 1000, 1, contractAddress);

        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly register a new Escrow - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.registerEscrow('notAnAddress', purchaser, 1000, 1, contractAddress))
            .rejects
            .toThrow(new Error('Not an address'));

        expect(mockedContract.registerEscrow)
            .toHaveBeenCalledTimes(0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(0);
    });

    it('should correctly retrieve escrow counter', async () => {
        const response = await escrowManagerDriver.getEscrowCounter();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getEscrowCounter)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrowCounter)
            .toHaveBeenNthCalledWith(1);
    });

    it('should correctly retrieve commissioner', async () => {
        const response = await escrowManagerDriver.getCommissioner();

        expect(response)
            .toEqual(commissioner);

        expect(mockedContract.getCommissioner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getCommissioner)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetCommissioner)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update commissioner', async () => {
        await escrowManagerDriver.updateCommissioner(payee);

        expect(mockedContract.updateCommissioner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateCommissioner)
            .toHaveBeenNthCalledWith(1, payee);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update commissioner - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.updateCommissioner('notAnAddress'))
            .rejects
            .toThrow(new Error('Not an address'));

        expect(mockedContract.updateCommissioner)
            .toHaveBeenCalledTimes(0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(0);
    });

    it('should correctly retrieve base fee', async () => {
        const response = await escrowManagerDriver.getBaseFee();

        expect(response)
            .toEqual(baseFee);

        expect(mockedContract.getBaseFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseFee)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetBaseFee)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update base fee', async () => {
        await escrowManagerDriver.updateBaseFee(10);

        expect(mockedContract.updateBaseFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateBaseFee)
            .toHaveBeenNthCalledWith(1, 10);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve percentage fee', async () => {
        const response = await escrowManagerDriver.getPercentageFee();

        expect(response)
            .toEqual(percentageFee);

        expect(mockedContract.getPercentageFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getPercentageFee)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetPercentageFee)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update percentage fee', async () => {
        await escrowManagerDriver.updatePercentageFee(10);

        expect(mockedContract.updatePercentageFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePercentageFee)
            .toHaveBeenNthCalledWith(1, 10);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update percentage fee - FAIL(Percentage fee must be between 0 and 100)', async () => {
        await expect(escrowManagerDriver.updatePercentageFee(101))
            .rejects
            .toThrow(new Error('Percentage fee must be between 0 and 100'));

        expect(mockedContract.updatePercentageFee)
            .toHaveBeenCalledTimes(0);
        expect(mockedWait)
            .toHaveBeenCalledTimes(0);
    });

    it('should correctly retrieve an Escrow', async () => {
        const response = await escrowManagerDriver.getEscrow(1);

        expect(response)
            .toEqual(escrowAddress);

        expect(mockedContract.getEscrow)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrow)
            .toHaveBeenNthCalledWith(1, 1);
        expect(mockedGetEscrow)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve IDs of purchaser\'s escrows', async () => {
        const response = await escrowManagerDriver.getEscrowIdsOfPurchaser(purchaser);

        expect(response)
            .toEqual([0]);

        expect(mockedContract.getEscrowIdsOfPurchaser)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrowIdsOfPurchaser)
            .toHaveBeenNthCalledWith(1, purchaser);
        expect(mockedGetEscrowIdsOfPurchaser)
            .toHaveBeenCalledTimes(1);
    });
});
