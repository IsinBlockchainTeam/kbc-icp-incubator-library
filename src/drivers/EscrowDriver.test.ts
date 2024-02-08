import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EscrowDriver } from './EscrowDriver';
import { Escrow as EscrowContract, Escrow__factory } from '../smart-contracts';
import { EscrowStatus } from '../types/EscrowStatus';

describe('EscrowDriver', () => {
    let escrowDriver: EscrowDriver;
    const payee: string = Wallet.createRandom().address;
    const purchaser: string = Wallet.createRandom().address;
    const delegate: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const boolean: boolean = false;

    let mockedSigner: Signer;

    const mockedEscrowConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedGetOwner = jest.fn();
    const mockedGetPayee = jest.fn();
    const mockedGetPurchaser = jest.fn();
    const mockedGetPayers = jest.fn();
    const mockedGetPayer = jest.fn();
    const mockedGetState = jest.fn();
    const mockedGetTokenAddress = jest.fn();
    const mockedGetCommissioner = jest.fn();
    const mockedGetBoolean = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedReadFunction.mockResolvedValue({
        toNumber: mockedToNumber,
    });
    mockedGetOwner.mockReturnValue(payee);
    mockedGetPayee.mockReturnValue(payee);
    mockedGetPurchaser.mockReturnValue(purchaser);
    mockedGetPayers.mockReturnValue([delegate]);
    mockedGetPayer.mockReturnValue({
        depositedAmount: BigNumber.from(0),
        isPresent: true,
    } as EscrowContract.PayerStructOutput);
    mockedGetState.mockReturnValue(EscrowStatus.ACTIVE);
    mockedGetTokenAddress.mockReturnValue(contractAddress);
    mockedGetCommissioner.mockReturnValue(commissioner);
    mockedGetBoolean.mockReturnValue(boolean);

    const mockedContract = createMock<EscrowContract>({
        getOwner: mockedGetOwner,
        getPayee: mockedGetPayee,
        getPurchaser: mockedGetPurchaser,
        getPayers: mockedGetPayers,
        getPayer: mockedGetPayer,
        getAgreedAmount: mockedReadFunction,
        getDeployedAt: mockedReadFunction,
        getDuration: mockedReadFunction,
        getState: mockedGetState,
        getDepositAmount: mockedReadFunction,
        getTokenAddress: mockedGetTokenAddress,
        getCommissioner: mockedGetCommissioner,
        getBaseFee: mockedReadFunction,
        getPercentageFee: mockedReadFunction,
        updateCommissioner: mockedWriteFunction,
        updateBaseFee: mockedWriteFunction,
        updatePercentageFee: mockedWriteFunction,
        getDeadline: mockedReadFunction,
        hasExpired: mockedGetBoolean,
        withdrawalAllowed: mockedGetBoolean,
        refundAllowed: mockedGetBoolean,
        addDelegate: mockedWriteFunction,
        removeDelegate: mockedWriteFunction,
        lock: mockedWriteFunction,
        deposit: mockedWriteFunction,
        close: mockedWriteFunction,
        enableRefund: mockedWriteFunction,
        enableRefundForExpiredEscrow: mockedWriteFunction,
        withdraw: mockedWriteFunction,
        refund: mockedWriteFunction,
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedEscrowConnect.mockReturnValue(mockedContract);
        const mockedEscrowContract = createMock<EscrowContract>({
            connect: mockedEscrowConnect,
        });
        jest.spyOn(Escrow__factory, 'connect')
            .mockReturnValue(mockedEscrowContract);

        mockedSigner = createMock<Signer>();
        escrowDriver = new EscrowDriver(mockedSigner, contractAddress);
    });

    afterEach(() => jest.clearAllMocks());

    it('should correctly retrieve owner', async () => {
        const response = await escrowDriver.getOwner();

        expect(response)
            .toEqual(payee);

        expect(mockedContract.getOwner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getOwner)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetOwner)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve payee', async () => {
        const response = await escrowDriver.getPayee();

        expect(response)
            .toEqual(payee);

        expect(mockedContract.getPayee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayee)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetPayee)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve purchaser', async () => {
        const response = await escrowDriver.getPurchaser();

        expect(response)
            .toEqual(purchaser);

        expect(mockedContract.getPurchaser)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getPurchaser)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetPurchaser)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve payers', async () => {
        const response = await escrowDriver.getPayers();

        expect(response)
            .toEqual([delegate]);

        expect(mockedContract.getPayers)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayers)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetPayers)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve payer', async () => {
        const response = await escrowDriver.getPayer(delegate);

        expect(response)
            .toEqual({
                depositedAmount: BigNumber.from(0),
                isPresent: true,
            } as EscrowContract.PayerStructOutput);

        expect(mockedContract.getPayer)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayer)
            .toHaveBeenNthCalledWith(1, delegate);
        expect(mockedGetPayer)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve agrees amount', async () => {
        const response = await escrowDriver.getAgreedAmount();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getAgreedAmount)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getAgreedAmount)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve deployed at', async () => {
        const response = await escrowDriver.getDeployedAt();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getDeployedAt)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeployedAt)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve duration', async () => {
        const response = await escrowDriver.getDuration();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getDuration)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getDuration)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve state - ACTIVE', async () => {
        const response = await escrowDriver.getState();

        expect(response)
            .toEqual(EscrowStatus.ACTIVE);

        expect(mockedContract.getState)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getState)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetState)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve state - LOCKED', async () => {
        mockedGetState.mockReturnValueOnce(EscrowStatus.LOCKED);
        const response = await escrowDriver.getState();

        expect(response)
            .toEqual(EscrowStatus.LOCKED);

        expect(mockedContract.getState)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getState)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetState)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve state - REFUNDING', async () => {
        mockedGetState.mockReturnValueOnce(EscrowStatus.REFUNDING);
        const response = await escrowDriver.getState();

        expect(response)
            .toEqual(EscrowStatus.REFUNDING);

        expect(mockedContract.getState)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getState)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetState)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve state - CLOSED', async () => {
        mockedGetState.mockReturnValueOnce(EscrowStatus.CLOSED);
        const response = await escrowDriver.getState();

        expect(response)
            .toEqual(EscrowStatus.CLOSED);

        expect(mockedContract.getState)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getState)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetState)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve state - FAIL(Invalid state)', async () => {
        mockedGetState.mockReturnValue(Promise.resolve(42));
        await expect(escrowDriver.getState())
            .rejects
            .toThrow('Invalid state');

        expect(mockedContract.getState)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getState)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetState)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve deposit amount', async () => {
        const response = await escrowDriver.getDepositAmount();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getDepositAmount)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getDepositAmount)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve token address', async () => {
        const response = await escrowDriver.getTokenAddress();

        expect(response)
            .toEqual(contractAddress);

        expect(mockedContract.getTokenAddress)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getTokenAddress)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetTokenAddress)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve commissioner', async () => {
        const response = await escrowDriver.getCommissioner();

        expect(response)
            .toEqual(commissioner);

        expect(mockedContract.getCommissioner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getCommissioner)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetCommissioner)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve base fee', async () => {
        const response = await escrowDriver.getBaseFee();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getBaseFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseFee)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve percentage fee', async () => {
        const response = await escrowDriver.getPercentageFee();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getPercentageFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getPercentageFee)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update commissioner', async () => {
        await escrowDriver.updateCommissioner(commissioner);

        expect(mockedContract.updateCommissioner)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateCommissioner)
            .toHaveBeenNthCalledWith(1, commissioner);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should update commissioner - FAIL(Not an address)', async () => {
        await expect(escrowDriver.updateCommissioner(''))
            .rejects
            .toThrow('Not an address');
    });

    it('should correctly update base fee', async () => {
        await escrowDriver.updateBaseFee(1);

        expect(mockedContract.updateBaseFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updateBaseFee)
            .toHaveBeenNthCalledWith(1, 1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly update percentage fee', async () => {
        await escrowDriver.updatePercentageFee(1);

        expect(mockedContract.updatePercentageFee)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePercentageFee)
            .toHaveBeenNthCalledWith(1, 1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should update percentage fee - FAIL(Percentage fee must be between 0 and 100)', async () => {
        await expect(escrowDriver.updatePercentageFee(101))
            .rejects
            .toThrow('Percentage fee must be between 0 and 100');
    });

    it('should correctly retrieve deadline', async () => {
        const response = await escrowDriver.getDeadline();

        expect(response)
            .toEqual(1);

        expect(mockedContract.getDeadline)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeadline)
            .toHaveBeenNthCalledWith(1);
        expect(mockedToNumber)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve has expired', async () => {
        const response = await escrowDriver.hasExpired();

        expect(response)
            .toEqual(boolean);

        expect(mockedContract.hasExpired)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.hasExpired)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve withdrawal allowed', async () => {
        const response = await escrowDriver.withdrawalAllowed();

        expect(response)
            .toEqual(boolean);

        expect(mockedContract.withdrawalAllowed)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.withdrawalAllowed)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve refund allowed', async () => {
        const response = await escrowDriver.refundAllowed();

        expect(response)
            .toEqual(boolean);

        expect(mockedContract.refundAllowed)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.refundAllowed)
            .toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly add delegate', async () => {
        await escrowDriver.addDelegate(delegate);

        expect(mockedContract.addDelegate)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.addDelegate)
            .toHaveBeenNthCalledWith(1, delegate);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should add delegate - FAIL(Not an address)', async () => {
        await expect(escrowDriver.addDelegate(''))
            .rejects
            .toThrow('Not an address');
    });

    it('should correctly remove delegate', async () => {
        await escrowDriver.removeDelegate(delegate);

        expect(mockedContract.removeDelegate)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.removeDelegate)
            .toHaveBeenNthCalledWith(1, delegate);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should remove delegate - FAIL(Not an address)', async () => {
        await expect(escrowDriver.removeDelegate(''))
            .rejects
            .toThrow('Not an address');
    });

    it('should correctly deposit', async () => {
        const amount = 1;
        await escrowDriver.deposit(amount);

        expect(mockedContract.deposit)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.deposit)
            .toHaveBeenNthCalledWith(1, amount);

        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly lock', async () => {
        await escrowDriver.lock();

        expect(mockedContract.lock)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.lock)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly close', async () => {
        await escrowDriver.close();

        expect(mockedContract.close)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.close)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly enable refund', async () => {
        await escrowDriver.enableRefund();

        expect(mockedContract.enableRefund)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.enableRefund)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly enable refund for expired escrow', async () => {
        await escrowDriver.enableRefundForExpiredEscrow();

        expect(mockedContract.enableRefundForExpiredEscrow)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.enableRefundForExpiredEscrow)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly withdraw', async () => {
        await escrowDriver.withdraw();

        expect(mockedContract.withdraw)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.withdraw)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });

    it('should correctly refund', async () => {
        await escrowDriver.refund();

        expect(mockedContract.refund)
            .toHaveBeenCalledTimes(1);
        expect(mockedContract.refund)
            .toHaveBeenNthCalledWith(1);
        expect(mockedWait)
            .toHaveBeenCalledTimes(1);
    });
});
