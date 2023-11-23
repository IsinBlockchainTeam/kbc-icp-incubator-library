import {BigNumber, Signer, Wallet} from 'ethers';
import { createMock } from 'ts-auto-mock';
import { EscrowDriver } from "./EscrowDriver";
import { EntityBuilder } from '../utils/EntityBuilder';
import { Escrow as EscrowContract, Escrow__factory } from "../smart-contracts";
import { Escrow } from "../entities/Escrow";
import { EscrowStatus } from "../types/EscrowStatus";

describe('EscrowDriver', () => {
    let escrowDriver: EscrowDriver;
    const payee: string = Wallet.createRandom().address;
    const purchaser: string = Wallet.createRandom().address;
    const delegate: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const commissioner: string = Wallet.createRandom().address;
    const boolean = false;

    let mockedSigner: Signer;

    const mockedEscrowConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedReadFunction = jest.fn();
    //const mockedGetEscrow = jest.fn();
    const mockedGetPayee = jest.fn();
    const mockedGetPurchaser = jest.fn();
    const mockedGetPayers= jest.fn();
    const mockedGetState = jest.fn();
    const mockedGetTokenAddress = jest.fn();
    const mockedGetCommissioner = jest.fn();
    const mockedGetBoolean = jest.fn();

    const mockedEscrow: Escrow = createMock<Escrow>();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait,
    });
    mockedReadFunction.mockResolvedValue({
        toNumber: mockedToNumber,
    });
    mockedGetPayee.mockReturnValue(Promise.resolve(payee));
    mockedGetPurchaser.mockReturnValue(Promise.resolve(purchaser));
    mockedGetPayers.mockReturnValue(Promise.resolve([{
        payerAddress: delegate,
        depositedAmount: BigNumber.from(0),
    }] as EscrowContract.PayersStructOutput[]));
    mockedGetState.mockReturnValue(Promise.resolve(EscrowStatus.ACTIVE));
    mockedGetTokenAddress.mockReturnValue(Promise.resolve(contractAddress));
    mockedGetCommissioner.mockReturnValue(Promise.resolve(commissioner));
    mockedGetBoolean.mockReturnValue(Promise.resolve(boolean));

    const mockedContract = createMock<EscrowContract>({
        getPayee: mockedGetPayee,
        getPurchaser: mockedGetPurchaser,
        getPayers: mockedGetPayers,
        getAgreedAmount: mockedReadFunction,
        getDeployedAt: mockedReadFunction,
        getDuration: mockedReadFunction,
        getState: mockedGetState,
        getDepositAmount: mockedReadFunction,
        getTokenAddress: mockedGetTokenAddress,
        getCommissioner: mockedGetCommissioner,
        getDeadline: mockedReadFunction,
        hasExpired: mockedGetBoolean,
        withdrawalAllowed: mockedGetBoolean,
        refundAllowed: mockedGetBoolean,
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
        jest.spyOn(Escrow__factory, 'connect').mockReturnValue(mockedEscrowContract);
        const buildEscrowSpy = jest.spyOn(EntityBuilder, 'buildEscrow');
        buildEscrowSpy.mockReturnValue(mockedEscrow);

        mockedSigner = createMock<Signer>();
        escrowDriver = new EscrowDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly retrieve payee', async () => {
        const response = await escrowDriver.getPayee();

        expect(response).toEqual(payee);

        expect(mockedContract.getPayee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayee).toHaveBeenNthCalledWith(1);
        expect(mockedGetPayee).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve purchaser', async () => {
        const response = await escrowDriver.getPurchaser();

        expect(response).toEqual(purchaser);

        expect(mockedContract.getPurchaser).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPurchaser).toHaveBeenNthCalledWith(1);
        expect(mockedGetPurchaser).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve payers', async () => {
        const response = await escrowDriver.getPayers();

        expect(response).toEqual([{
            payerAddress: delegate,
            depositedAmount: BigNumber.from(0),
        }] as EscrowContract.PayersStructOutput[]);

        expect(mockedContract.getPayers).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPayers).toHaveBeenNthCalledWith(1);
        expect(mockedGetPayers).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve agrees amount', async () => {
        const response = await escrowDriver.getAgreedAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getAgreedAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getAgreedAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
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

    it('should correctly retrieve state', async () => {
        const response = await escrowDriver.getState();

        expect(response).toEqual(EscrowStatus.ACTIVE);

        expect(mockedContract.getState).toHaveBeenCalledTimes(1);
        expect(mockedContract.getState).toHaveBeenNthCalledWith(1);
        expect(mockedGetState).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve deposit amount', async () => {
        const response = await escrowDriver.getDepositAmount();

        expect(response).toEqual(1);

        expect(mockedContract.getDepositAmount).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDepositAmount).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve token address', async () => {
        const response = await escrowDriver.getTokenAddress();

        expect(response).toEqual(contractAddress);

        expect(mockedContract.getTokenAddress).toHaveBeenCalledTimes(1);
        expect(mockedContract.getTokenAddress).toHaveBeenNthCalledWith(1);
        expect(mockedGetTokenAddress).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve commissioner', async () => {
        const response = await escrowDriver.getCommissioner();

        expect(response).toEqual(commissioner);

        expect(mockedContract.getCommissioner).toHaveBeenCalledTimes(1);
        expect(mockedContract.getCommissioner).toHaveBeenNthCalledWith(1);
        expect(mockedGetCommissioner).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve deadline', async () => {
        const response = await escrowDriver.getDeadline();

        expect(response).toEqual(1);

        expect(mockedContract.getDeadline).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDeadline).toHaveBeenNthCalledWith(1);
        expect(mockedToNumber).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve has expired', async () => {
        const response = await escrowDriver.hasExpired();

        expect(response).toEqual(boolean);

        expect(mockedContract.hasExpired).toHaveBeenCalledTimes(1);
        expect(mockedContract.hasExpired).toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve withdrawal allowed', async () => {
        const response = await escrowDriver.withdrawalAllowed();

        expect(response).toEqual(boolean);

        expect(mockedContract.withdrawalAllowed).toHaveBeenCalledTimes(1);
        expect(mockedContract.withdrawalAllowed).toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean).toHaveBeenCalledTimes(1);
    });

    it('should correctly retrieve refund allowed', async () => {
        const response = await escrowDriver.refundAllowed();

        expect(response).toEqual(boolean);

        expect(mockedContract.refundAllowed).toHaveBeenCalledTimes(1);
        expect(mockedContract.refundAllowed).toHaveBeenNthCalledWith(1);
        expect(mockedGetBoolean).toHaveBeenCalledTimes(1);
    });

    it('should correctly deposit', async () => {
        const amount = 1;
        await escrowDriver.deposit(amount);

        expect(mockedContract.deposit).toHaveBeenCalledTimes(1);
        expect(mockedContract.deposit).toHaveBeenNthCalledWith(1, amount);

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly close', async () => {
        await escrowDriver.close();

        expect(mockedContract.close).toHaveBeenCalledTimes(1);
        expect(mockedContract.close).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly enable refund', async () => {
        await escrowDriver.enableRefund();

        expect(mockedContract.enableRefund).toHaveBeenCalledTimes(1);
        expect(mockedContract.enableRefund).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly enable refund for expired escrow', async () => {
        await escrowDriver.enableRefundForExpiredEscrow();

        expect(mockedContract.enableRefundForExpiredEscrow).toHaveBeenCalledTimes(1);
        expect(mockedContract.enableRefundForExpiredEscrow).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly withdraw', async () => {
        await escrowDriver.withdraw();

        expect(mockedContract.withdraw).toHaveBeenCalledTimes(1);
        expect(mockedContract.withdraw).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should correctly refund', async () => {
        await escrowDriver.refund();

        expect(mockedContract.refund).toHaveBeenCalledTimes(1);
        expect(mockedContract.refund).toHaveBeenNthCalledWith(1);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
});