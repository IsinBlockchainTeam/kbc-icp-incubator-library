import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EscrowManagerDriver } from '../EscrowManagerDriver';
import { EscrowManager, EscrowManager__factory } from '../../smart-contracts';
import { RoleProof } from '../../types/RoleProof';

describe('EscrowManagerDriver', () => {
    let escrowManagerDriver: EscrowManagerDriver;
    const admin: string = Wallet.createRandom().address;
    const payee: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const escrowAddress: string = Wallet.createRandom().address;
    const feeRecipient: string = Wallet.createRandom().address;
    const baseFee: number = 20;
    const percentageFee: number = 1;

    const roleProof: RoleProof = createMock<RoleProof>();

    let mockedSigner: Signer;

    const mockedEscrowManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetFeeRecipient = jest.fn();
    const mockedGetBaseFee = jest.fn();
    const mockedGetPercentageFee = jest.fn();
    const mockedGetEscrow = jest.fn();
    const mockedGetEscrowCounter = jest.fn();
    const mockedGetEscrowIdsOfPurchaser = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });
    mockedGetFeeRecipient.mockReturnValue(Promise.resolve(feeRecipient));
    mockedGetBaseFee.mockReturnValue(Promise.resolve(BigNumber.from(baseFee)));
    mockedGetPercentageFee.mockReturnValue(Promise.resolve(BigNumber.from(percentageFee)));
    mockedGetEscrow.mockReturnValue(Promise.resolve(escrowAddress));
    mockedGetEscrowCounter.mockReturnValue(BigNumber.from(1));
    mockedGetEscrowIdsOfPurchaser.mockReturnValue(Promise.resolve([BigNumber.from(0)]));

    const mockedContract = createMock<EscrowManager>({
        registerEscrow: mockedWriteFunction,
        getFeeRecipient: mockedGetFeeRecipient,
        updateFeeRecipient: mockedWriteFunction,
        getBaseFee: mockedGetBaseFee,
        updateBaseFee: mockedWriteFunction,
        getPercentageFee: mockedGetPercentageFee,
        updatePercentageFee: mockedWriteFunction,
        getEscrow: mockedGetEscrow,
        getEscrowCounter: mockedGetEscrowCounter,
        addAdmin: mockedWriteFunction,
        removeAdmin: mockedWriteFunction
    });

    beforeAll(() => {
        mockedEscrowManagerConnect.mockReturnValue(mockedContract);
        const mockedEscrowManager = createMock<EscrowManager>({
            connect: mockedEscrowManagerConnect
        });
        jest.spyOn(EscrowManager__factory, 'connect').mockReturnValue(mockedEscrowManager);

        mockedSigner = createMock<Signer>();
        escrowManagerDriver = new EscrowManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly register a new Escrow', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'EscrowRegistered',
                    args: {
                        id: BigNumber.from(1),
                        escrowAddress
                    }
                }
            ],
            transactionHash: 'transactionHash'
        });
        const resp = await escrowManagerDriver.registerEscrow(
            roleProof,
            admin,
            payee,
            1000,
            contractAddress
        );
        expect(resp).toEqual([1, escrowAddress, 'transactionHash']);
        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerEscrow).toHaveBeenNthCalledWith(
            1,
            roleProof,
            admin,
            payee,
            1000,
            contractAddress
        );

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly register a new Escrow - admin - FAIL(Not an address)', async () => {
        await expect(
            escrowManagerDriver.registerEscrow(
                roleProof,
                'notAnAddress',
                payee,
                1000,
                contractAddress
            )
        ).rejects.toThrow(new Error('Not an address'));

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly register a new Escrow - payee - FAIL(Not an address)', async () => {
        await expect(
            escrowManagerDriver.registerEscrow(
                roleProof,
                admin,
                'notAnAddress',
                1000,
                contractAddress
            )
        ).rejects.toThrow(new Error('Not an address'));

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly register a new Escrow - FAIL(Duration below 0)', async () => {
        await expect(
            escrowManagerDriver.registerEscrow(roleProof, admin, payee, -1, contractAddress)
        ).rejects.toThrow(new Error('Duration must be greater than 0'));

        expect(mockedContract.registerEscrow).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly register a new Escrow - FAIL(Error during escrow registration, no events found)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: null,
            transactionHash: 'transactionHash'
        });
        await expect(
            escrowManagerDriver.registerEscrow(roleProof, admin, payee, 1000, contractAddress)
        ).rejects.toThrow(new Error('Error during escrow registration, no events found'));
    });
    it('should correctly register a new Escrow - FAIL(Error during escrow registration, escrow not registered)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'OtherEvent',
                    args: {
                        id: BigNumber.from(1),
                        escrowAddress
                    }
                }
            ],
            transactionHash: 'transactionHash'
        });
        await expect(
            escrowManagerDriver.registerEscrow(roleProof, admin, payee, 1000, contractAddress)
        ).rejects.toThrow(new Error('Error during escrow registration, escrow not registered'));
    });
    it('should correctly retrieve escrow counter', async () => {
        const response = await escrowManagerDriver.getEscrowCounter(roleProof);

        expect(response).toEqual(1);

        expect(mockedContract.getEscrowCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrowCounter).toHaveBeenNthCalledWith(1, roleProof);
    });
    it('should correctly retrieve fee recipient', async () => {
        const response = await escrowManagerDriver.getFeeRecipient(roleProof);

        expect(response).toEqual(feeRecipient);

        expect(mockedContract.getFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.getFeeRecipient).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedGetFeeRecipient).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve base fee', async () => {
        const response = await escrowManagerDriver.getBaseFee(roleProof);

        expect(response).toEqual(baseFee);

        expect(mockedContract.getBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseFee).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedGetBaseFee).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve percentage fee', async () => {
        const response = await escrowManagerDriver.getPercentageFee(roleProof);

        expect(response).toEqual(percentageFee);

        expect(mockedContract.getPercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPercentageFee).toHaveBeenNthCalledWith(1, roleProof);
        expect(mockedGetPercentageFee).toHaveBeenCalledTimes(1);
    });
    it('should correctly update fee recipient', async () => {
        await escrowManagerDriver.updateFeeRecipient(payee);

        expect(mockedContract.updateFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateFeeRecipient).toHaveBeenNthCalledWith(1, payee);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update fee recipient - FAIL(Not an address)', async () => {
        await expect(escrowManagerDriver.updateFeeRecipient('notAnAddress')).rejects.toThrow(
            new Error('Not an address')
        );

        expect(mockedContract.updateFeeRecipient).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly update base fee', async () => {
        await escrowManagerDriver.updateBaseFee(10);

        expect(mockedContract.updateBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateBaseFee).toHaveBeenNthCalledWith(1, 10);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update base fee - FAIL(Base fee must be greater than 0)', async () => {
        await expect(escrowManagerDriver.updateBaseFee(-1)).rejects.toThrow(
            new Error('Base fee must be greater than 0')
        );
    });
    it('should correctly update percentage fee', async () => {
        await escrowManagerDriver.updatePercentageFee(10);

        expect(mockedContract.updatePercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePercentageFee).toHaveBeenNthCalledWith(1, 10);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update percentage fee - FAIL(Percentage fee must be between 0 and 100)', async () => {
        await expect(escrowManagerDriver.updatePercentageFee(101)).rejects.toThrow(
            new Error('Percentage fee must be between 0 and 100')
        );

        expect(mockedContract.updatePercentageFee).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly retrieve an Escrow', async () => {
        const response = await escrowManagerDriver.getEscrow(roleProof, 1);

        expect(response).toEqual(escrowAddress);

        expect(mockedContract.getEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.getEscrow).toHaveBeenNthCalledWith(1, roleProof, 1);
        expect(mockedGetEscrow).toHaveBeenCalledTimes(1);
    });
    it('should correctly add an admin', async () => {
        await escrowManagerDriver.addAdmin(admin);

        expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
        expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(1, admin);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(escrowManagerDriver.addAdmin('notAnAddress')).rejects.toThrow(
            new Error('Not an address')
        );
    });
    it('should correctly remove an admin', async () => {
        await escrowManagerDriver.removeAdmin(admin);

        expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
        expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(1, admin);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(escrowManagerDriver.removeAdmin('notAnAddress')).rejects.toThrow(
            new Error('Not an address')
        );
    });
});
