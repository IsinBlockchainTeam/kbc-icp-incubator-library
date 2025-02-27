import { Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { DownPaymentDriver } from '../DownPaymentDriver';
import { DownPayment as DownPaymentContract, DownPayment__factory } from '../../smart-contracts';
import { DownPaymentStatus } from '../../types/DownPaymentStatus';

describe('DownPaymentDriver', () => {
    let downPaymentDriver: DownPaymentDriver;
    const payee: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const feeRecipient: string = Wallet.createRandom().address;
    const boolean: boolean = false;

    let mockedSigner: Signer;

    const mockedDownPaymentConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    const mockedGetOwner = jest.fn();
    const mockedGetPayee = jest.fn();
    const mockedGetPayers = jest.fn();
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
    mockedGetPayers.mockReturnValue([payee]);
    mockedGetState.mockReturnValue(DownPaymentStatus.ACTIVE);
    mockedGetTokenAddress.mockReturnValue(contractAddress);
    mockedGetFeeRecipient.mockReturnValue(feeRecipient);
    mockedGetBoolean.mockReturnValue(boolean);

    const mockedContract = createMock<DownPaymentContract>({
        getOwner: mockedGetOwner,
        getPayee: mockedGetPayee,
        getPayers: mockedGetPayers,
        getDeployedAt: mockedReadFunction,
        getDuration: mockedReadFunction,
        getDeadline: mockedReadFunction,
        getTokenAddress: mockedGetTokenAddress,
        getFeeRecipient: mockedGetFeeRecipient,
        getBaseFee: mockedReadFunction,
        getPercentageFee: mockedReadFunction,
        getFees: mockedReadFunction,
        getTotalDepositedAmount: mockedReadFunction,
        getDepositedAmount: mockedReadFunction,
        getLockedAmount: mockedReadFunction,
        getReleasableAmount: mockedReadFunction,
        getReleasedAmount: mockedReadFunction,
        getTotalRefundableAmount: mockedReadFunction,
        getRefundedAmount: mockedReadFunction,
        getTotalRefundedAmount: mockedReadFunction,
        getBalance: mockedReadFunction,
        getWithdrawableAmount: mockedReadFunction,
        getRefundableAmount: mockedReadFunction,
        updateFeeRecipient: mockedWriteFunction,
        updateBaseFee: mockedWriteFunction,
        updatePercentageFee: mockedWriteFunction,
        isExpired: mockedGetBoolean,
        lockFunds: mockedWriteFunction,
        releaseFunds: mockedWriteFunction,
        refundFunds: mockedWriteFunction,
        deposit: mockedWriteFunction,
        withdraw: mockedWriteFunction,
        addAdmin: mockedWriteFunction,
        removeAdmin: mockedWriteFunction
    });

    beforeAll(() => {
        mockedToNumber.mockReturnValue(1);

        mockedDownPaymentConnect.mockReturnValue(mockedContract);
        const mockedDownPaymentContract = createMock<DownPaymentContract>({
            connect: mockedDownPaymentConnect
        });
        jest.spyOn(DownPayment__factory, 'connect').mockReturnValue(mockedDownPaymentContract);

        mockedSigner = createMock<Signer>();
        downPaymentDriver = new DownPaymentDriver(mockedSigner, contractAddress);
    });

    afterEach(() => jest.clearAllMocks());

    it('should correctly retrieve owner', async () => {
        const response = await downPaymentDriver.getOwner();

        expect(response).toEqual(payee);

        expect(mockedContract.getOwner).toHaveBeenCalledTimes(1);
        expect(mockedContract.getOwner).toHaveBeenNthCalledWith(1);
        expect(mockedGetOwner).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve payee', async () => {
        const response = await downPaymentDriver.getPayee();

        expect(response).toEqual(payee);

        expect(mockedContract.getPayee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayee).toHaveBeenNthCalledWith(1);
        expect(mockedGetPayee).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve payers', async () => {
        const response = await downPaymentDriver.getPayers();

        expect(response).toEqual([payee]);

        expect(mockedContract.getPayers).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayers).toHaveBeenNthCalledWith(1);
        expect(mockedGetPayers).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve deployed at', async () => {
        const response = await downPaymentDriver.getDeployedAt();

        expect(response).toEqual(1);

        expect(mockedContract.getDeployedAt).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeployedAt).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve duration', async () => {
        const response = await downPaymentDriver.getDuration();

        expect(response).toEqual(1);

        expect(mockedContract.getDuration).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDuration).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve deadline', async () => {
        const response = await downPaymentDriver.getDeadline();

        expect(response).toEqual(1);

        expect(mockedContract.getDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeadline).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve token address', async () => {
        const response = await downPaymentDriver.getTokenAddress();

        expect(response).toEqual(contractAddress);

        expect(mockedContract.getTokenAddress).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTokenAddress).toHaveBeenNthCalledWith(1);
        expect(mockedGetTokenAddress).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve fee recipient', async () => {
        const response = await downPaymentDriver.getFeeRecipient();

        expect(response).toEqual(feeRecipient);

        expect(mockedContract.getFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.getFeeRecipient).toHaveBeenNthCalledWith(1);
        expect(mockedGetFeeRecipient).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve base fee', async () => {
        const response = await downPaymentDriver.getBaseFee();

        expect(response).toEqual(1);

        expect(mockedContract.getBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseFee).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve percentage fee', async () => {
        const response = await downPaymentDriver.getPercentageFee();

        expect(response).toEqual(1);

        expect(mockedContract.getPercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPercentageFee).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve fees', async () => {
        const response = await downPaymentDriver.getFees(10);

        expect(response).toEqual(1);

        expect(mockedContract.getFees).toHaveBeenCalledTimes(1);
        expect(mockedContract.getFees).toHaveBeenNthCalledWith(1, 10);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.getFees(-1)).rejects.toThrow(
            'Amount must be greater than 0'
        );
    });
    it('should correctly retrieve total deposited amount', async () => {
        const response = await downPaymentDriver.getTotalDepositedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getTotalDepositedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTotalDepositedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve deposited amount', async () => {
        const response = await downPaymentDriver.getDepositedAmount(payee);

        expect(response).toEqual(1);

        expect(mockedContract.getDepositedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDepositedAmount).toHaveBeenNthCalledWith(1, payee);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.getDepositedAmount('0xpayer')).rejects.toThrow(
            'Not an address'
        );
    });
    it('should correctly retrieve locked amount', async () => {
        const response = await downPaymentDriver.getLockedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getLockedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getLockedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve releasable amount', async () => {
        const response = await downPaymentDriver.getReleasableAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getReleasableAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getReleasableAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve released amount', async () => {
        const response = await downPaymentDriver.getReleasedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getReleasedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getReleasedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve total refundable amount', async () => {
        const response = await downPaymentDriver.getTotalRefundableAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getTotalRefundableAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTotalRefundableAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve refunded amount', async () => {
        const response = await downPaymentDriver.getRefundedAmount(payee);

        expect(response).toEqual(1);

        expect(mockedContract.getRefundedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getRefundedAmount).toHaveBeenNthCalledWith(1, payee);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.getRefundedAmount('0xpayer')).rejects.toThrow(
            'Not an address'
        );
    });
    it('should correctly retrieve total refunded amount', async () => {
        const response = await downPaymentDriver.getTotalRefundedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getTotalRefundedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTotalRefundedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve balance', async () => {
        const response = await downPaymentDriver.getBalance();

        expect(response).toEqual(1);

        expect(mockedContract.getBalance).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBalance).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve withdrawable amount', async () => {
        const response = await downPaymentDriver.getWithdrawableAmount(payee);

        expect(response).toEqual(1);

        expect(mockedContract.getWithdrawableAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getWithdrawableAmount).toHaveBeenNthCalledWith(1, payee);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.getWithdrawableAmount('0xpayer')).rejects.toThrow(
            'Not an address'
        );
    });
    it('should correctly retrieve refundable amount', async () => {
        const response = await downPaymentDriver.getRefundableAmount(1, payee);

        expect(response).toEqual(1);

        expect(mockedContract.getRefundableAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getRefundableAmount).toHaveBeenNthCalledWith(1, 1, payee);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.getRefundableAmount(-1, payee)).rejects.toThrow(
            'Amount must be greater than 0'
        );
        await expect(downPaymentDriver.getRefundableAmount(1, '0xpayer')).rejects.toThrow(
            'Not an address'
        );
    });
    it('should correctly update fee recipient', async () => {
        await downPaymentDriver.updateFeeRecipient(payee);

        expect(mockedContract.updateFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateFeeRecipient).toHaveBeenNthCalledWith(1, payee);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.updateFeeRecipient('0xpayer')).rejects.toThrow(
            'Not an address'
        );
    });
    it('should correctly update base fee', async () => {
        await downPaymentDriver.updateBaseFee(1);

        expect(mockedContract.updateBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateBaseFee).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.updateBaseFee(-1)).rejects.toThrow(
            'Base fee must be greater than or equal to 0'
        );
    });
    it('should correctly update percentage fee', async () => {
        await downPaymentDriver.updatePercentageFee(1);

        expect(mockedContract.updatePercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePercentageFee).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.updatePercentageFee(-1)).rejects.toThrow(
            'Percentage fee must be between 0 and 100'
        );
    });
    it('should correctly check if expired', async () => {
        const response = await downPaymentDriver.isExpired();

        expect(response).toEqual(boolean);

        expect(mockedContract.isExpired).toHaveBeenCalledTimes(1);
        expect(mockedContract.isExpired).toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean).toHaveBeenCalledTimes(1);
    });
    it('should correctly lock funds', async () => {
        await downPaymentDriver.lockFunds(1);

        expect(mockedContract.lockFunds).toHaveBeenCalledTimes(1);
        expect(mockedContract.lockFunds).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.lockFunds(-1)).rejects.toThrow(
            'Amount must be greater than 0'
        );
    });
    it('should correctly release funds', async () => {
        await downPaymentDriver.releaseFunds(1);

        expect(mockedContract.releaseFunds).toHaveBeenCalledTimes(1);
        expect(mockedContract.releaseFunds).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.releaseFunds(-1)).rejects.toThrow(
            'Amount must be greater than 0'
        );
    });
    it('should correctly refund funds', async () => {
        await downPaymentDriver.refundFunds(1);

        expect(mockedContract.refundFunds).toHaveBeenCalledTimes(1);
        expect(mockedContract.refundFunds).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.refundFunds(-1)).rejects.toThrow(
            'Amount must be greater than 0'
        );
    });
    it('should correctly deposit', async () => {
        await downPaymentDriver.deposit(1, payee);

        expect(mockedContract.deposit).toHaveBeenCalledTimes(1);
        expect(mockedContract.deposit).toHaveBeenNthCalledWith(1, 1, payee);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.deposit(-1, payee)).rejects.toThrow(
            'Amount must be greater than or equal to 0'
        );
        await expect(downPaymentDriver.deposit(1, '0xpayer')).rejects.toThrow('Not an address');
    });
    it('should correctly withdraw', async () => {
        await downPaymentDriver.withdraw(1);

        expect(mockedContract.withdraw).toHaveBeenCalledTimes(1);
        expect(mockedContract.withdraw).toHaveBeenNthCalledWith(1, 1);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.withdraw(-1)).rejects.toThrow(
            'Amount must be greater than or equal to 0'
        );
    });
    it('should correctly add admin', async () => {
        await downPaymentDriver.addAdmin(payee);

        expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
        expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(1, payee);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.addAdmin('0xpayer')).rejects.toThrow('Not an address');
    });
    it('should correctly remove admin', async () => {
        await downPaymentDriver.removeAdmin(payee);

        expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
        expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(1, payee);
        expect(mockedWriteFunction).toHaveBeenCalledTimes(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentDriver.removeAdmin('0xpayer')).rejects.toThrow('Not an address');
    });
});
