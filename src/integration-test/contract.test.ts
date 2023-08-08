import { IdentityEthersDriver } from '@blockchain-lib/common';
import { JsonRpcProvider } from '@ethersproject/providers';
import { ethers } from 'ethers';
import ContractService from '../services/ContractService';
import { OrderDriver } from '../drivers/OrderDriver';
import {
    CONTRACT_MANAGER_CONTRACT_ADDRESS,
    CUSTOMER_INVOKER_ADDRESS,
    CUSTOMER_INVOKER_PRIVATE_KEY,
    NETWORK,
    SUPPLIER_INVOKER_ADDRESS,
    SUPPLIER_INVOKER_PRIVATE_KEY,
} from './config';
import { Order } from '../entities/Order';
import { OrderLine } from '../entities/OrderLine';
import { OrderStatus } from '../types/OrderStatus';

describe('Order lifecycle', () => {
    let contractService: ContractService;
    let contractDriver: OrderDriver;
    let identityDriver: IdentityEthersDriver;
    let provider: JsonRpcProvider;
    let contractCounterId = 0;
    let contractLineCounterId = 0;
    let contractStatus: OrderStatus;

    beforeAll(async () => {
        provider = new ethers.providers.JsonRpcProvider(NETWORK);
        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        contractDriver = new OrderDriver(
            identityDriver,
            provider,
            CONTRACT_MANAGER_CONTRACT_ADDRESS,
        );
        contractService = new ContractService(contractDriver);
    });

    it('Should correctly register and retrieve a contract with a line', async () => {
        const contract: Order = new Order(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, 'externalUrl', CUSTOMER_INVOKER_ADDRESS);
        const contractLine: OrderLine = new OrderLine('CategoryA', 20, {
            amount: 5.2,
            fiat: 'USD',
        });
        contract.lines = [contractLine];

        await contractService.registerContract(contract);
        contractCounterId = await contractService.getContractCounter(SUPPLIER_INVOKER_ADDRESS);
        const { lineIds } = await contractService.getContractInfo(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        contractLineCounterId = lineIds.splice(-1)[0];

        const savedContract = await contractService.getContractInfo(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        expect(savedContract).toBeDefined();
        expect(savedContract.id).toEqual(contractCounterId);
        expect(savedContract.supplier).toEqual(contract.supplier);
        expect(savedContract.customer).toEqual(contract.customer);
        expect(savedContract.externalUrl).toEqual(contract.externalUrl);
        expect(savedContract.offeree).toEqual(contract.offeree);
        expect(savedContract.offeror).toEqual(SUPPLIER_INVOKER_ADDRESS);
        expect(savedContract.offereeSigned).toBeFalsy();
        expect(savedContract.offerorSigned).toBeFalsy();

        const savedContractLine = await contractService.getContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, contractLineCounterId);
        expect(savedContractLine.id).toEqual(contractLineCounterId);
        expect(savedContractLine.price).toEqual(contract.lines[0].price);
        expect(savedContractLine.quantity).toEqual(contract.lines[0].quantity);
        expect(savedContractLine.productCategory).toEqual(contract.lines[0].productCategory);
    });

    it('Should check if a contract exists', async () => {
        const exists = await contractService.contractExists(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        expect(exists).toBeDefined();
        expect(exists).toBeTruthy();
    });

    it('Should throw error while getting a contract if supplier is not an address', async () => {
        const fn = async () => contractService.getContractInfo('address', 1);
        await expect(fn).rejects.toThrowError(new Error('Not an address'));
    });

    it('Should check that the contract status is INITIALIZED (no signatures)', async () => {
        const contract: Order = new Order(SUPPLIER_INVOKER_ADDRESS, CUSTOMER_INVOKER_ADDRESS, 'externalUrl', CUSTOMER_INVOKER_ADDRESS);
        await contractService.registerContract(contract);
        contractCounterId = await contractService.getContractCounter(SUPPLIER_INVOKER_ADDRESS);
        contractStatus = await contractService.getContractStatus(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        expect(contractStatus).toEqual(OrderStatus.INITIALIZED);
    });

    it('Should add a line to a contract as a supplier', async () => {
        contractCounterId = await contractService.getContractCounter(SUPPLIER_INVOKER_ADDRESS);
        const line = new OrderLine('CategoryB', 20, {
            amount: 5.2,
            fiat: 'USD',
        });

        await contractService.addContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, line);
        const { lineIds } = await contractService.getContractInfo(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        contractLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await contractService.getContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, contractLineCounterId);
        line.id = contractLineCounterId;
        expect(savedLine).toEqual(line);

        contractStatus = await contractService.getContractStatus(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        expect(contractStatus).toEqual(OrderStatus.PENDING);
    });

    it('Should add a line to a new contract as a customer', async () => {
        identityDriver = new IdentityEthersDriver(CUSTOMER_INVOKER_PRIVATE_KEY, provider);
        contractDriver = new OrderDriver(identityDriver, provider, CONTRACT_MANAGER_CONTRACT_ADDRESS);
        contractService = new ContractService(contractDriver);

        contractCounterId = await contractService.getContractCounter(SUPPLIER_INVOKER_ADDRESS);
        const line = new OrderLine('CategoryA', 50, {
            amount: 50.5,
            fiat: 'USD',
        });

        await contractService.addContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, line);
        const { lineIds } = await contractService.getContractInfo(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        contractLineCounterId = lineIds.splice(-1)[0];

        const savedLine = await contractService.getContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, contractLineCounterId);
        line.id = contractLineCounterId;
        expect(savedLine).toEqual(line);

        contractStatus = await contractService.getContractStatus(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        expect(contractStatus).toEqual(OrderStatus.PENDING);
    });

    it('should confirm as supplier the contract updated by the customer', async () => {
        identityDriver = new IdentityEthersDriver(SUPPLIER_INVOKER_PRIVATE_KEY, provider);
        contractDriver = new OrderDriver(identityDriver, provider, CONTRACT_MANAGER_CONTRACT_ADDRESS);
        contractService = new ContractService(contractDriver);

        contractCounterId = await contractService.getContractCounter(SUPPLIER_INVOKER_ADDRESS);
        await contractService.confirmContract(SUPPLIER_INVOKER_ADDRESS, contractCounterId);

        contractStatus = await contractService.getContractStatus(SUPPLIER_INVOKER_ADDRESS, contractCounterId);
        expect(contractStatus).toEqual(OrderStatus.COMPLETED);
    });

    it('should try to add a line to a negotiated contract', async () => {
        const contractLine = new OrderLine('CategoryA', 50, {
            amount: 50.5,
            fiat: 'USD',
        });
        // updates cannot be possible because the contract has been confirmed by both parties
        const fn = async () => contractService.updateContractLine(SUPPLIER_INVOKER_ADDRESS, contractCounterId, contractLineCounterId, contractLine);
        await expect(fn).rejects.toThrowError(/The contract has been confirmed, it cannot be changed/);
    });
});
