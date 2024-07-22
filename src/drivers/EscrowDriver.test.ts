import { Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EscrowDriver } from './EscrowDriver';
import { Escrow as EscrowContract, Escrow__factory } from '../smart-contracts';
import { EscrowStatus } from '../types/EscrowStatus';

describe('EscrowDriver', () => {
    let escrowDriver: EscrowDriver;
    const payee: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const feeRecipient: string = Wallet.createRandom().address;
    const boolean: boolean = false;

    let mockedSigner: Signer;

    const mockedEscrowConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedGetOwner = jest.fn();
    const mockedGetPayee = jest.fn();
    const mockedGetState = jest.fn();
    const mockedGetTokenAddress = jest.fn();
    const mockedGetFeeRecipient = jest.fn();
    const mockedGetBoolean = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });
    mockedReadFunction.mockResolvedValue({
        toNumber: mockedToNumber
    });
    mockedGetOwner.mockReturnValue(payee);
    mockedGetPayee.mockReturnValue(payee);
    mockedGetState.mockReturnValue(EscrowStatus.ACTIVE);
    mockedGetTokenAddress.mockReturnValue(contractAddress);
    mockedGetFeeRecipient.mockReturnValue(feeRecipient);
    mockedGetBoolean.mockReturnValue(boolean);

    const mockedContract = createMock<EscrowContract>({
        getOwner: mockedGetOwner,
        getPayee: mockedGetPayee,
        getDeployedAt: mockedReadFunction,
        getDuration: mockedReadFunction,
        getDeadline: mockedReadFunction,
        getTokenAddress: mockedGetTokenAddress,
        getState: mockedGetState,
        getFeeRecipient: mockedGetFeeRecipient,
        getBaseFee: mockedReadFunction,
        getPercentageFee: mockedReadFunction,
        getFees: mockedReadFunction,
        getDepositedAmount: mockedReadFunction,
        getTotalDepositedAmount: mockedReadFunction,
        getRefundedAmount: mockedReadFunction,
        getTotalRefundedAmount: mockedReadFunction,
        getTotalWithdrawnAmount: mockedReadFunction,
        getRefundablePercentage: mockedReadFunction,
        getWithdrawablePercentage: mockedReadFunction,
        getWithdrawableAmount: mockedReadFunction,
        getRefundableAmount: mockedReadFunction,
        updateFeeRecipient: mockedWriteFunction,
        updateBaseFee: mockedWriteFunction,
        updatePercentageFee: mockedWriteFunction,
        isExpired: mockedGetBoolean,
        enableWithdrawal: mockedWriteFunction,
        enableRefund: mockedWriteFunction,
        deposit: mockedWriteFunction,
        payerWithdraw: mockedWriteFunction,
        payeeWithdraw: mockedWriteFunction,
        payerRefund: mockedWriteFunction,
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedEscrowConnect.mockReturnValue(mockedContract);
        const mockedEscrowContract = createMock<EscrowContract>({
            connect: mockedEscrowConnect
        });
        jest.spyOn(Escrow__factory, 'connect').mockReturnValue(mockedEscrowContract);

        mockedSigner = createMock<Signer>();
        escrowDriver = new EscrowDriver(mockedSigner, contractAddress);
    });

    afterEach(() => jest.clearAllMocks());

    it('should correctly retrieve owner', async () => {
        const response = await escrowDriver.getOwner();

        expect(response).toEqual(payee);

        expect(mockedContract.getOwner).toHaveBeenCalledTimes(1);
        expect(mockedContract.getOwner).toHaveBeenNthCalledWith(1);
        expect(mockedGetOwner).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve payee', async () => {
        const response = await escrowDriver.getPayee();

        expect(response).toEqual(payee);

        expect(mockedContract.getPayee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayee).toHaveBeenNthCalledWith(1);
        expect(mockedGetPayee).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve deployed at', async () => {
        const response = await escrowDriver.getDeployedAt();

        expect(response).toEqual(1);

        expect(mockedContract.getDeployedAt).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeployedAt).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve duration', async () => {
        const response = await escrowDriver.getDuration();

        expect(response).toEqual(1);

        expect(mockedContract.getDuration).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDuration).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve deadline', async () => {
        const response = await escrowDriver.getDeadline();

        expect(response).toEqual(1);

        expect(mockedContract.getDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeadline).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve token address', async () => {
        const response = await escrowDriver.getTokenAddress();

        expect(response).toEqual(contractAddress);

        expect(mockedContract.getTokenAddress).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTokenAddress).toHaveBeenNthCalledWith(1);
        expect(mockedGetTokenAddress).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve state - ACTIVE', async () => {
        const response = await escrowDriver.getState();

        expect(response).toEqual(EscrowStatus.ACTIVE);

        expect(mockedContract.getState).toHaveBeenCalledTimes(1);
        expect(mockedContract.getState).toHaveBeenNthCalledWith(1);
        expect(mockedGetState).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve state - WITHDRAWING', async () => {
        mockedGetState.mockReturnValueOnce(EscrowStatus.WITHDRAWING);
        const response = await escrowDriver.getState();

        expect(response).toEqual(EscrowStatus.WITHDRAWING);

        expect(mockedContract.getState).toHaveBeenCalledTimes(1);
        expect(mockedContract.getState).toHaveBeenNthCalledWith(1);
        expect(mockedGetState).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve state - REFUNDING', async () => {
        mockedGetState.mockReturnValueOnce(EscrowStatus.REFUNDING);
        const response = await escrowDriver.getState();

        expect(response).toEqual(EscrowStatus.REFUNDING);

        expect(mockedContract.getState).toHaveBeenCalledTimes(1);
        expect(mockedContract.getState).toHaveBeenNthCalledWith(1);
        expect(mockedGetState).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve state - Invalid state', async () => {
        mockedGetState.mockReturnValue(Promise.resolve(42));
        await expect(escrowDriver.getState()).rejects.toThrow('Invalid state');

        expect(mockedContract.getState).toHaveBeenCalledTimes(1);
        expect(mockedContract.getState).toHaveBeenNthCalledWith(1);
        expect(mockedGetState).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve fee recipient', async () => {
        const response = await escrowDriver.getFeeRecipient();

        expect(response).toEqual(feeRecipient);

        expect(mockedContract.getFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.getFeeRecipient).toHaveBeenNthCalledWith(1);
        expect(mockedGetFeeRecipient).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve base fee', async () => {
        const response = await escrowDriver.getBaseFee();

        expect(response).toEqual(1);

        expect(mockedContract.getBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseFee).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve percentage fee', async () => {
        const response = await escrowDriver.getPercentageFee();

        expect(response).toEqual(1);

        expect(mockedContract.getPercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPercentageFee).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve fees', async () => {
        const response = await escrowDriver.getFees(10);

        expect(response).toEqual(1);

        expect(mockedContract.getFees).toHaveBeenCalledTimes(1);
        expect(mockedContract.getFees).toHaveBeenNthCalledWith(1, 10);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve deposited amount', async () => {
        const response = await escrowDriver.getDepositedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getDepositedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDepositedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve total deposited amount', async () => {
        const response = await escrowDriver.getTotalDepositedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getTotalDepositedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTotalDepositedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve refunded amount', async () => {
        const response = await escrowDriver.getRefundedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getRefundedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getRefundedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve total refunded amount', async () => {
        const response = await escrowDriver.getTotalRefundedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getTotalRefundedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTotalRefundedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve total withdrawn amount', async () => {
        const response = await escrowDriver.getTotalWithdrawnAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getTotalWithdrawnAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTotalWithdrawnAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve refundable percentage', async () => {
        const response = await escrowDriver.getRefundablePercentage();

        expect(response).toEqual(1);

        expect(mockedContract.getRefundablePercentage).toHaveBeenCalledTimes(1);
        expect(mockedContract.getRefundablePercentage).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve withdrawable percentage', async () => {
        const response = await escrowDriver.getWithdrawablePercentage();

        expect(response).toEqual(1);

        expect(mockedContract.getWithdrawablePercentage).toHaveBeenCalledTimes(1);
        expect(mockedContract.getWithdrawablePercentage).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve withdrawable amount', async () => {
        const response = await escrowDriver.getWithdrawableAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getWithdrawableAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getWithdrawableAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve refundable amount', async () => {
        const response = await escrowDriver.getRefundableAmount(payee);

        expect(response).toEqual(1);

        expect(mockedContract.getRefundableAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getRefundableAmount).toHaveBeenNthCalledWith(1, payee);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve refundable amount - FAIL(Not an address)', async () => {
        await expect(escrowDriver.getRefundableAmount('')).rejects.toThrow('Not an address');
    });

    it('should correctly update fee recipient', async () => {
        await escrowDriver.updateFeeRecipient(feeRecipient);

        expect(mockedContract.updateFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateFeeRecipient).toHaveBeenNthCalledWith(1, feeRecipient);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should update fee recipient - FAIL(Not an address)', async () => {
        await expect(escrowDriver.updateFeeRecipient('')).rejects.toThrow('Not an address');
    });
    it('should correctly update base fee', async () => {
        await escrowDriver.updateBaseFee(1);

        expect(mockedContract.updateBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateBaseFee).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update base fee - FAIL(Base fee must be greater than or equal to 0)', async () => {
        await expect(escrowDriver.updateBaseFee(-1)).rejects.toThrow(
            'Base fee must be greater than or equal to 0'
        );
    });
    it('should correctly update percentage fee', async () => {
        await escrowDriver.updatePercentageFee(1);

        expect(mockedContract.updatePercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePercentageFee).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should update percentage fee - FAIL(Percentage fee must be between 0 and 100)', async () => {
        await expect(escrowDriver.updatePercentageFee(101)).rejects.toThrow(
            'Percentage fee must be between 0 and 100'
        );
    });

    it('should correctly retrieve is expired', async () => {
        const response = await escrowDriver.isExpired();

        expect(response).toEqual(boolean);

        expect(mockedContract.isExpired).toHaveBeenCalledTimes(1);
        expect(mockedContract.isExpired).toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean).toHaveBeenCalledTimes(1);
    });

    it('should correctly enable withdrawal', async () => {
        await escrowDriver.enableWithdrawal(1);

        expect(mockedContract.enableWithdrawal).toHaveBeenCalledTimes(1);
        expect(mockedContract.enableWithdrawal).toHaveBeenNthCalledWith(1, 1);
    });
    it('should correctly enable withdrawal - FAIL(Percentage must be between 0 and 100)', async () => {
        await expect(escrowDriver.enableWithdrawal(101)).rejects.toThrow('Percentage must be between 0 and 100');
    });
    it('should correctly enable refund', async () => {
        await escrowDriver.enableRefund(1);

        expect(mockedContract.enableRefund).toHaveBeenCalledTimes(1);
        expect(mockedContract.enableRefund).toHaveBeenNthCalledWith(1, 1);
    });
    it('should correctly enable refund - FAIL(Percentage must be between 0 and 100)', async () => {
        await expect(escrowDriver.enableRefund(101)).rejects.toThrow('Percentage must be between 0 and 100');
    });

    it('should correctly deposit', async () => {
        const amount = 1;
        await escrowDriver.deposit(amount);

        expect(mockedContract.deposit).toHaveBeenCalledTimes(1);
        expect(mockedContract.deposit).toHaveBeenNthCalledWith(1, amount);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly deposit - FAIL(Amount must be greater than or equal to 0)', async () => {
        await expect(escrowDriver.deposit(-1)).rejects.toThrow('Amount must be greater than or equal to 0');

    });
    it('should correctly (payer) withdraw', async () => {
        const amount = 1;
        await escrowDriver.payerWithdraw(amount);

        expect(mockedContract.payerWithdraw).toHaveBeenCalledTimes(1);
        expect(mockedContract.payerWithdraw).toHaveBeenNthCalledWith(1, amount);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly (payer) withdraw - FAIL(Amount must be greater than or equal to 0)', async () => {
        await expect(escrowDriver.payerWithdraw(-1)).rejects.toThrow('Amount must be greater than or equal to 0');

    });
    it('should correctly (payee) withdraw', async () => {
        await escrowDriver.payeeWithdraw();

        expect(mockedContract.payeeWithdraw).toHaveBeenCalledTimes(1);
        expect(mockedContract.payeeWithdraw).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly refund', async () => {
        await escrowDriver.payerRefund();

        expect(mockedContract.payerRefund).toHaveBeenCalledTimes(1);
        expect(mockedContract.payerRefund).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
});
