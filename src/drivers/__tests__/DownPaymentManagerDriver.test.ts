import { BigNumber, Signer, Wallet } from 'ethers';
import { createMock } from 'ts-auto-mock';
import { DownPaymentManagerDriver } from '../DownPaymentManagerDriver';
import { DownPaymentManager, DownPaymentManager__factory } from '../../smart-contracts';

describe('DownPaymentManagerDriver', () => {
    let downPaymentManagerDriver: DownPaymentManagerDriver;
    const admin: string = Wallet.createRandom().address;
    const payee: string = Wallet.createRandom().address;
    const contractAddress: string = Wallet.createRandom().address;
    const downPaymentAddress: string = Wallet.createRandom().address;
    const feeRecipient: string = Wallet.createRandom().address;
    const baseFee: number = 20;
    const percentageFee: number = 1;

    let mockedSigner: Signer;

    const mockedDownPaymentManagerConnect = jest.fn();
    const mockedWait = jest.fn();

    const mockedWriteFunction = jest.fn();
    const mockedGetFeeRecipient = jest.fn();
    const mockedGetBaseFee = jest.fn();
    const mockedGetPercentageFee = jest.fn();
    const mockedGetDownPayment = jest.fn();
    const mockedGetDownPaymentCounter = jest.fn();
    const mockedGetDownPaymentIdsOfPurchaser = jest.fn();

    mockedWriteFunction.mockResolvedValue({
        wait: mockedWait
    });
    mockedGetFeeRecipient.mockReturnValue(Promise.resolve(feeRecipient));
    mockedGetBaseFee.mockReturnValue(Promise.resolve(BigNumber.from(baseFee)));
    mockedGetPercentageFee.mockReturnValue(Promise.resolve(BigNumber.from(percentageFee)));
    mockedGetDownPayment.mockReturnValue(Promise.resolve(downPaymentAddress));
    mockedGetDownPaymentCounter.mockReturnValue(BigNumber.from(1));
    mockedGetDownPaymentIdsOfPurchaser.mockReturnValue(Promise.resolve([BigNumber.from(0)]));

    const mockedContract = createMock<DownPaymentManager>({
        registerDownPayment: mockedWriteFunction,
        getFeeRecipient: mockedGetFeeRecipient,
        updateFeeRecipient: mockedWriteFunction,
        getBaseFee: mockedGetBaseFee,
        updateBaseFee: mockedWriteFunction,
        getPercentageFee: mockedGetPercentageFee,
        updatePercentageFee: mockedWriteFunction,
        getDownPayment: mockedGetDownPayment,
        getDownPaymentCounter: mockedGetDownPaymentCounter,
        addAdmin: mockedWriteFunction,
        removeAdmin: mockedWriteFunction
    });

    beforeAll(() => {
        mockedDownPaymentManagerConnect.mockReturnValue(mockedContract);
        const mockedDownPaymentManager = createMock<DownPaymentManager>({
            connect: mockedDownPaymentManagerConnect
        });
        jest.spyOn(DownPaymentManager__factory, 'connect').mockReturnValue(
            mockedDownPaymentManager
        );

        mockedSigner = createMock<Signer>();
        downPaymentManagerDriver = new DownPaymentManagerDriver(mockedSigner, contractAddress);
    });

    afterAll(() => jest.clearAllMocks());

    it('should correctly register a new down payment', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'DownPaymentRegistered',
                    args: {
                        id: BigNumber.from(1),
                        downPaymentAddress: downPaymentAddress
                    }
                }
            ],
            transactionHash: 'transactionHash'
        });
        const resp = await downPaymentManagerDriver.registerDownPayment(
            admin,
            payee,
            1000,
            contractAddress
        );
        expect(resp).toEqual([1, downPaymentAddress, 'transactionHash']);
        expect(mockedContract.registerDownPayment).toHaveBeenCalledTimes(1);
        expect(mockedContract.registerDownPayment).toHaveBeenNthCalledWith(
            1,
            admin,
            payee,
            1000,
            contractAddress
        );

        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly register a new down payment - admin - FAIL(Not an address)', async () => {
        await expect(
            downPaymentManagerDriver.registerDownPayment(
                'notAnAddress',
                payee,
                1000,
                contractAddress
            )
        ).rejects.toThrow(new Error('Not an address'));

        expect(mockedContract.registerDownPayment).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly register a new down payment - payee - FAIL(Not an address)', async () => {
        await expect(
            downPaymentManagerDriver.registerDownPayment(
                admin,
                'notAnAddress',
                1000,
                contractAddress
            )
        ).rejects.toThrow(new Error('Not an address'));

        expect(mockedContract.registerDownPayment).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly register a new down payment - FAIL(Duration below 0)', async () => {
        await expect(
            downPaymentManagerDriver.registerDownPayment(admin, payee, -1, contractAddress)
        ).rejects.toThrow(new Error('Duration must be greater than 0'));

        expect(mockedContract.registerDownPayment).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly register a new down payment - FAIL(Error during down payment registration, no events found)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: null,
            transactionHash: 'transactionHash'
        });
        await expect(
            downPaymentManagerDriver.registerDownPayment(admin, payee, 1000, contractAddress)
        ).rejects.toThrow(new Error('Error during down payment registration, no events found'));
    });
    it('should correctly register a new down payment - FAIL(Error during down payment registration, down payment not registered)', async () => {
        mockedWait.mockResolvedValueOnce({
            events: [
                {
                    event: 'OtherEvent',
                    args: {
                        id: BigNumber.from(1),
                        downPaymentAddress: downPaymentAddress
                    }
                }
            ],
            transactionHash: 'transactionHash'
        });
        await expect(
            downPaymentManagerDriver.registerDownPayment(admin, payee, 1000, contractAddress)
        ).rejects.toThrow(
            new Error('Error during down payment registration, down payment not registered')
        );
    });
    it('should correctly retrieve down payment counter', async () => {
        const response = await downPaymentManagerDriver.getDownPaymentCounter();

        expect(response).toEqual(1);

        expect(mockedContract.getDownPaymentCounter).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDownPaymentCounter).toHaveBeenNthCalledWith(1);
    });
    it('should correctly retrieve fee recipient', async () => {
        const response = await downPaymentManagerDriver.getFeeRecipient();

        expect(response).toEqual(feeRecipient);

        expect(mockedContract.getFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.getFeeRecipient).toHaveBeenNthCalledWith(1);
        expect(mockedGetFeeRecipient).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve base fee', async () => {
        const response = await downPaymentManagerDriver.getBaseFee();

        expect(response).toEqual(baseFee);

        expect(mockedContract.getBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getBaseFee).toHaveBeenNthCalledWith(1);
        expect(mockedGetBaseFee).toHaveBeenCalledTimes(1);
    });
    it('should correctly retrieve percentage fee', async () => {
        const response = await downPaymentManagerDriver.getPercentageFee();

        expect(response).toEqual(percentageFee);

        expect(mockedContract.getPercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.getPercentageFee).toHaveBeenNthCalledWith(1);
        expect(mockedGetPercentageFee).toHaveBeenCalledTimes(1);
    });
    it('should correctly update fee recipient', async () => {
        await downPaymentManagerDriver.updateFeeRecipient(payee);

        expect(mockedContract.updateFeeRecipient).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateFeeRecipient).toHaveBeenNthCalledWith(1, payee);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update fee recipient - FAIL(Not an address)', async () => {
        await expect(downPaymentManagerDriver.updateFeeRecipient('notAnAddress')).rejects.toThrow(
            new Error('Not an address')
        );

        expect(mockedContract.updateFeeRecipient).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly update base fee', async () => {
        await downPaymentManagerDriver.updateBaseFee(10);

        expect(mockedContract.updateBaseFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updateBaseFee).toHaveBeenNthCalledWith(1, 10);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update base fee - FAIL(Base fee must be greater than 0)', async () => {
        await expect(downPaymentManagerDriver.updateBaseFee(-1)).rejects.toThrow(
            new Error('Base fee must be greater than 0')
        );
    });
    it('should correctly update percentage fee', async () => {
        await downPaymentManagerDriver.updatePercentageFee(10);

        expect(mockedContract.updatePercentageFee).toHaveBeenCalledTimes(1);
        expect(mockedContract.updatePercentageFee).toHaveBeenNthCalledWith(1, 10);
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });
    it('should correctly update percentage fee - FAIL(Percentage fee must be between 0 and 100)', async () => {
        await expect(downPaymentManagerDriver.updatePercentageFee(101)).rejects.toThrow(
            new Error('Percentage fee must be between 0 and 100')
        );

        expect(mockedContract.updatePercentageFee).toHaveBeenCalledTimes(0);
        expect(mockedWait).toHaveBeenCalledTimes(0);
    });
    it('should correctly retrieve a down payment', async () => {
        const response = await downPaymentManagerDriver.getDownPayment(1);

        expect(response).toEqual(downPaymentAddress);

        expect(mockedContract.getDownPayment).toHaveBeenCalledTimes(1);
        expect(mockedContract.getDownPayment).toHaveBeenNthCalledWith(1, 1);
        expect(mockedGetDownPayment).toHaveBeenCalledTimes(1);
    });
    it('should correctly add an admin', async () => {
        await downPaymentManagerDriver.addAdmin(admin);

        expect(mockedContract.addAdmin).toHaveBeenCalledTimes(1);
        expect(mockedContract.addAdmin).toHaveBeenNthCalledWith(1, admin);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentManagerDriver.addAdmin('notAnAddress')).rejects.toThrow(
            new Error('Not an address')
        );
    });
    it('should correctly remove an admin', async () => {
        await downPaymentManagerDriver.removeAdmin(admin);

        expect(mockedContract.removeAdmin).toHaveBeenCalledTimes(1);
        expect(mockedContract.removeAdmin).toHaveBeenNthCalledWith(1, admin);
        expect(mockedWait).toHaveBeenCalledTimes(1);

        await expect(downPaymentManagerDriver.removeAdmin('notAnAddress')).rejects.toThrow(
            new Error('Not an address')
        );
    });
});
