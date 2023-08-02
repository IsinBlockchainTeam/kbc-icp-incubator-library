import { ContractLine } from '../entities/ContractLine';
import { ContractDriver } from '../drivers/ContractDriver';
import { Contract } from '../entities/Contract';
import { ContractStatus } from '../types/ContractStatus';

export class ContractService {
    private _contractDriver: ContractDriver;

    constructor(contractDriver: ContractDriver) {
        this._contractDriver = contractDriver;
    }

    async registerContract(contract: Contract): Promise<void> {
        await this._contractDriver.registerContract(contract);
    }

    async getContractCounter(supplierAddress: string): Promise<number> {
        return this._contractDriver.getContractCounter(supplierAddress);
    }

    async getContractInfo(supplierAddress: string, id: number): Promise<Contract> {
        return this._contractDriver.getContractInfo(supplierAddress, id);
    }

    async isSupplierOrCustomer(supplierAddress: string, id: number, senderAddress: string): Promise<boolean> {
        return this._contractDriver.isSupplierOrCustomer(supplierAddress, id, senderAddress);
    }

    async contractExists(supplierAddress: string, id: number): Promise<boolean> {
        return this._contractDriver.contractExists(supplierAddress, id);
    }

    async getContractStatus(supplierAddress: string, id: number): Promise<ContractStatus> {
        return this._contractDriver.getContractStatus(supplierAddress, id);
    }

    async confirmContract(supplierAddress: string, id: number): Promise<void> {
        await this._contractDriver.confirmContract(supplierAddress, id);
    }

    async getContractLine(supplierAddress: string, contractId: number, contractLineId: number): Promise<ContractLine> {
        return this._contractDriver.getContractLine(supplierAddress, contractId, contractLineId);
    }

    async updateContractLine(supplierAddress: string, contractId: number, contractLineId: number, contractLine: ContractLine): Promise<void> {
        return this._contractDriver.updateContractLine(supplierAddress, contractId, contractLineId, contractLine);
    }

    async addContractLine(supplierAddress: string, contractId: number, contractLine: ContractLine): Promise<void> {
        return this._contractDriver.addContractLine(supplierAddress, contractId, contractLine);
    }

    async addAdmin(address: string): Promise<void> {
        await this._contractDriver.addAdmin(address);
    }

    async removeAdmin(address: string): Promise<void> {
        await this._contractDriver.removeAdmin(address);
    }
}

export default ContractService;
