/* eslint-disable camelcase */
import { JsonRpcProvider } from '@ethersproject/providers';
import { createMock } from 'ts-auto-mock';
import { IdentityEthersDriver } from '@blockchain-lib/common';
import { BigNumber, ethers } from 'ethers';
import { ContractManager, ContractManager__factory } from '../smart-contracts';
import { ContractDriver } from './ContractDriver';
import { Contract } from '../entities/Contract';
import { ContractLine } from '../entities/ContractLine';

describe('ContractDriver', () => {
    let contractDriver: ContractDriver;
    let contract: Contract;

    const testAddress = '0x6C9E9ADB5F57952434A4148b401502d9c6C70318';
    const errorMessage = 'testError';

    let mockedIdentityDriver: IdentityEthersDriver;
    let mockedProvider: JsonRpcProvider;

    const mockedContractConnect = jest.fn();
    const mockedWait = jest.fn();
    const mockedToNumber = jest.fn();
    const mockedRegisterContract = jest.fn();
    const mockedGetContractInfo = jest.fn();
    const mockedIsSupplierOrCustomer = jest.fn();
    const mockedGetContractStatus = jest.fn();
    const mockedGetContractCounter = jest.fn();
    const mockedGetContractLineCounter = jest.fn();
    const mockedContractExists = jest.fn();
    const mockedConfirmContract = jest.fn();
    const mockedGetContractLine = jest.fn();
    const mockedAddContractLine = jest.fn();
    const mockedUpdateContractLine = jest.fn();
    const mockedAddAdmin = jest.fn();
    const mockedRemoveAdmin = jest.fn();
    const mockedDecodeEventLog = jest.fn();

    const supplier = ethers.Wallet.createRandom();
    const customer = ethers.Wallet.createRandom();

    beforeAll(() => {
        mockedRegisterContract.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'ContractRegistered' }] }),
        }));
        mockedGetContractCounter.mockReturnValue(Promise.resolve({
            toNumber: mockedToNumber,
        }));
        mockedGetContractStatus.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedGetContractLineCounter.mockReturnValue(Promise.resolve({
            toNumber: mockedToNumber,
        }));
        mockedAddContractLine.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedGetContractLine.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedUpdateContractLine.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedContractExists.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedConfirmContract.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedAddAdmin.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedRemoveAdmin.mockReturnValue(Promise.resolve({
            wait: mockedWait,
        }));
        mockedDecodeEventLog.mockReturnValue({ id: BigNumber.from(0) });

        mockedContractConnect.mockReturnValue({
            registerContract: mockedRegisterContract,
            getContractInfo: mockedGetContractInfo,
            isSupplierOrCustomer: mockedIsSupplierOrCustomer,
            getContractCounter: mockedGetContractCounter,
            contractExists: mockedContractExists,
            confirmContract: mockedConfirmContract,
            getContractStatus: mockedGetContractStatus,
            getContractLine: mockedGetContractLine,
            getContractLineCounter: mockedGetContractLineCounter,
            addContractLine: mockedAddContractLine,
            updateContractLine: mockedUpdateContractLine,
            addAdmin: mockedAddAdmin,
            removeAdmin: mockedRemoveAdmin,
            interface: { decodeEventLog: mockedDecodeEventLog },
        });
        const mockedContractManager = createMock<ContractManager>({
            connect: mockedContractConnect,
        });
        jest.spyOn(ContractManager__factory, 'connect').mockReturnValue(mockedContractManager);

        mockedIdentityDriver = createMock<IdentityEthersDriver>();
        mockedProvider = createMock<JsonRpcProvider>({
            _isProvider: true,
        });
        contractDriver = new ContractDriver(
            mockedIdentityDriver,
            mockedProvider,
            testAddress,
        );

        contract = new Contract(1, supplier.address, customer.address, 'https://testurl.ch', customer.address);
    });

    afterAll(() => {
        jest.restoreAllMocks();
    });

    it('should call and wait for register contract', async () => {
        await contractDriver.registerContract(contract);

        expect(mockedRegisterContract).toHaveBeenCalledTimes(1);
        expect(mockedRegisterContract).toHaveBeenNthCalledWith(
            1,
            contract.supplier,
            contract.customer,
            contract.customer,
            contract.externalUrl,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for register contract with contract lines', async () => {
        const price = {
            amount: 100.25,
            decimals: 2,
            fiat: 'CHF',
        };
        const contractLine = new ContractLine(4, 'categoryA', 100, {
            amount: price.amount,
            fiat: price.fiat,
        });
        const contract2 = new Contract(1, supplier.address, customer.address, 'https://testurl.ch', customer.address, supplier.address, [1], [contractLine]);

        mockedRegisterContract.mockReturnValue(Promise.resolve({
            wait: mockedWait.mockReturnValue({ events: [{ event: 'ContractRegistered', data: contract2 }] }),
        }));
        mockedDecodeEventLog.mockImplementation((eventName: string, data: Contract, topics: string[]) => ({ id: BigNumber.from(data.id) }));

        await contractDriver.registerContract(contract2);
        const rawContractLine: ContractManager.ContractLineStruct = {
            id: 0,
            productCategory: contractLine.productCategory,
            quantity: contractLine.quantity,
            price: {
                amount: 10025,
                fiat: price.fiat,
                decimals: price.decimals,
            },
            exists: true,
        };
        expect(mockedRegisterContract).toHaveBeenCalledTimes(1);
        expect(mockedRegisterContract).toHaveBeenNthCalledWith(
            1,
            contract2.supplier,
            contract2.customer,
            contract2.customer,
            contract2.externalUrl,
        );
        expect(mockedAddContractLine).toHaveBeenCalledTimes(1);
        expect(mockedAddContractLine).toHaveBeenNthCalledWith(
            1,
            contract2.supplier,
            contract2.id,
            rawContractLine,
        );
        expect(mockedWait).toHaveBeenCalledTimes(2);
    });

    it('should call and wait for register contract - transaction fails', async () => {
        mockedRegisterContract.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.registerContract(contract);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for register contract - fails for address', async () => {
        const contract3 = new Contract(1, supplier.address, '0xaddress', customer.address, 'https://testurl.ch', supplier.address, []);

        const fn = async () => contractDriver.registerContract(contract3);
        await expect(fn).rejects.toThrowError(new Error('Customer not an address'));
    });

    it('should check if contract exists', async () => {
        await contractDriver.contractExists(contract.supplier, 1);
        expect(mockedContractExists).toHaveBeenCalledTimes(1);
        expect(mockedContractExists).toHaveBeenNthCalledWith(1, contract.supplier, 1);
    });

    it('should get the contract counter ids', async () => {
        await contractDriver.getContractCounter(contract.supplier);
        expect(mockedGetContractCounter).toHaveBeenCalledTimes(1);
        expect(mockedGetContractCounter).toHaveBeenNthCalledWith(1, contract.supplier);
    });

    it('should confirm the contract', async () => {
        await contractDriver.confirmContract(contract.supplier, 1);
        expect(mockedConfirmContract).toHaveBeenCalledTimes(1);
        expect(mockedConfirmContract).toHaveBeenNthCalledWith(1, contract.supplier, 1);
    });

    it('should retrieve contract', async () => {
        mockedGetContractInfo.mockResolvedValue({
            id: { toNumber: () => contract.id },
            supplier: contract.supplier,
            customer: contract.customer,
            externalUrl: contract.externalUrl,
            offeree: contract.offeree,
            offeror: contract.offeror,
            lineIds: contract.lineIds,
        });

        const resp = await contractDriver.getContractInfo(contract.supplier, 1);

        expect(resp).toEqual(contract);

        expect(mockedGetContractInfo).toHaveBeenCalledTimes(1);
        expect(mockedGetContractInfo).toHaveBeenNthCalledWith(
            1,
            contract.supplier,
            1,
        );
    });

    it('should retrieve contract - transaction fails', async () => {
        mockedGetContractInfo.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.getContractInfo(contract.supplier, 1);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should retrieve contract - not an address', async () => {
        const fn = async () => contractDriver.getContractInfo('test', 1);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should check if the sender is supplier or customer', async () => {
        await contractDriver.isSupplierOrCustomer(supplier.address, 1, customer.address);
        expect(mockedIsSupplierOrCustomer).toHaveBeenCalledTimes(1);
        expect(mockedIsSupplierOrCustomer).toHaveBeenNthCalledWith(1, supplier.address, 1, customer.address);
    });

    it('should check if the sender is supplier or customer - supplier not an address', async () => {
        const fn = async () => contractDriver.isSupplierOrCustomer('0xaddress', 1, customer.address);
        await expect(fn).rejects.toThrowError(new Error('Supplier not an address'));
    });

    it('should check if the sender is supplier or customer - sender not an address', async () => {
        const fn = async () => contractDriver.isSupplierOrCustomer(supplier.address, 1, '0xaddress');
        await expect(fn).rejects.toThrowError(new Error('Sender not an address'));
    });

    it('should retrieve contract line', async () => {
        const contractLine = new ContractLine(3, 'categoryA', 100, {
            amount: 10,
            fiat: 'CHF',
        });
        mockedGetContractLine.mockResolvedValue({
            id: { toNumber: () => contractLine.id },
            productCategory: contractLine.productCategory,
            quantity: { toNumber: () => contractLine.quantity },
            price: {
                ...contractLine.price,
                amount: { toNumber: () => contractLine.price.amount },
                decimals: 0,
            },
            exists: true,
        });

        const resp = await contractDriver.getContractLine(contract.supplier, 1, contractLine.id as number);
        expect(resp).toEqual(contractLine);

        expect(mockedGetContractLine).toHaveBeenCalledTimes(1);
        expect(mockedGetContractLine).toHaveBeenNthCalledWith(
            1,
            contract.supplier,
            1,
            contractLine.id as number,
        );
    });

    it('should retrieve contract line - transaction fails', async () => {
        mockedGetContractLine.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.getContractLine(contract.supplier, 1, 2);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should retrieve contract line - not an address', async () => {
        const fn = async () => contractDriver.getContractLine('test', 1, 2);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should call and wait for add contract line', async () => {
        const price = {
            amount: 100,
            decimals: 0,
            fiat: 'CHF',
        };
        const contractLine = new ContractLine(4, 'categoryA', 100, {
            amount: price.amount,
            fiat: price.fiat,
        });
        await contractDriver.addContractLine(supplier.address, contract.id as number, contractLine);
        const rawContractLine: ContractManager.ContractLineStruct = {
            id: 0,
            productCategory: contractLine.productCategory,
            quantity: contractLine.quantity,
            price,
            exists: true,
        };
        expect(mockedAddContractLine).toHaveBeenCalledTimes(1);
        expect(mockedAddContractLine).toHaveBeenNthCalledWith(
            1,
            contract.supplier,
            contract.id,
            rawContractLine,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for add contract line - fails', async () => {
        const contractLine = new ContractLine(3, 'categoryA', 100, {
            amount: 10,
            fiat: 'CHF',
        });
        mockedAddContractLine.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.addContractLine(supplier.address, contract.id as number, contractLine);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for update contract line', async () => {
        const price = {
            amount: 10000.5,
            decimals: 1,
            fiat: 'CHF',
        };
        const contractLine = new ContractLine(4, 'categoryUpdated', 100, {
            amount: price.amount,
            fiat: price.fiat,
        });
        await contractDriver.updateContractLine(supplier.address, contract.id!, contractLine.id!, contractLine);
        const rawContractLine: ContractManager.ContractLineStruct = {
            id: 0,
            productCategory: contractLine.productCategory,
            quantity: contractLine.quantity,
            price,
            exists: true,
        };
        expect(mockedUpdateContractLine).toHaveBeenCalledTimes(1);
        rawContractLine.price.amount = 100005;
        expect(mockedUpdateContractLine).toHaveBeenNthCalledWith(
            1,
            contract.supplier,
            contract.id,
            contractLine.id,
            rawContractLine,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for update contract line - fails', async () => {
        const contractLine = new ContractLine(3, 'categoryUpdated', 100, {
            amount: 10,
            fiat: 'CHF',
        });
        mockedUpdateContractLine.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.updateContractLine(supplier.address, contract.id!, contractLine.id!, contractLine);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should get the contract status', async () => {
        await contractDriver.getContractStatus(contract.supplier, 1);
        expect(mockedGetContractStatus).toHaveBeenCalledTimes(1);
        expect(mockedGetContractStatus).toHaveBeenNthCalledWith(1, contract.supplier, 1);
    });

    it('should get the contract status - fail due to wrong address', async () => {
        const fn = async () => contractDriver.getContractStatus('0xaddress', 1);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should call and wait for add admin', async () => {
        const { address } = ethers.Wallet.createRandom();
        await contractDriver.addAdmin(address);

        expect(mockedAddAdmin).toHaveBeenCalledTimes(1);
        expect(mockedAddAdmin).toHaveBeenNthCalledWith(
            1,
            address,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for add admin - transaction fails', async () => {
        const { address } = ethers.Wallet.createRandom();
        mockedAddAdmin.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.addAdmin(address);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for add admin - fails for address', async () => {
        const address = '123';

        const fn = async () => contractDriver.addAdmin(address);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('should call and wait for remove admin', async () => {
        const { address } = ethers.Wallet.createRandom();
        await contractDriver.removeAdmin(address);

        expect(mockedRemoveAdmin).toHaveBeenCalledTimes(1);
        expect(mockedRemoveAdmin).toHaveBeenNthCalledWith(
            1,
            address,
        );
        expect(mockedWait).toHaveBeenCalledTimes(1);
    });

    it('should call and wait for remove admin - transaction fails', async () => {
        const { address } = ethers.Wallet.createRandom();
        mockedRemoveAdmin.mockRejectedValue(new Error(errorMessage));

        const fn = async () => contractDriver.removeAdmin(address);
        await expect(fn).rejects.toThrowError(new Error(errorMessage));
    });

    it('should call and wait for remove admin - fails for address', async () => {
        const address = '123';

        const fn = async () => contractDriver.removeAdmin(address);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });
});
