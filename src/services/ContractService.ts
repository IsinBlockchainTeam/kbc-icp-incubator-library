import { OrderLine } from '../entities/OrderLine';
import { OrderDriver } from '../drivers/OrderDriver';
import { Order } from '../entities/Order';
import { OrderStatus } from '../types/OrderStatus';

export class ContractService {
    private _contractDriver: OrderDriver;

    constructor(contractDriver: OrderDriver) {
        this._contractDriver = contractDriver;
    }

    async registerContract(contract: Order): Promise<void> {
        await this._contractDriver.registerContract(contract);
    }

    async getContractCounter(supplierAddress: string): Promise<number> {
        return this._contractDriver.getContractCounter(supplierAddress);
    }

    async getContractInfo(supplierAddress: string, id: number): Promise<Order> {
        return this._contractDriver.getContractInfo(supplierAddress, id);
    }

    async isSupplierOrCustomer(supplierAddress: string, id: number, senderAddress: string): Promise<boolean> {
        return this._contractDriver.isSupplierOrCustomer(supplierAddress, id, senderAddress);
    }

    async contractExists(supplierAddress: string, id: number): Promise<boolean> {
        return this._contractDriver.contractExists(supplierAddress, id);
    }

    async getContractStatus(supplierAddress: string, id: number): Promise<OrderStatus> {
        return this._contractDriver.getContractStatus(supplierAddress, id);
    }

    async confirmContract(supplierAddress: string, id: number): Promise<void> {
        await this._contractDriver.confirmContract(supplierAddress, id);
    }

    async getContractLine(supplierAddress: string, contractId: number, contractLineId: number): Promise<OrderLine> {
        return this._contractDriver.getContractLine(supplierAddress, contractId, contractLineId);
    }

    async updateContractLine(supplierAddress: string, contractId: number, contractLineId: number, contractLine: OrderLine): Promise<void> {
        return this._contractDriver.updateContractLine(supplierAddress, contractId, contractLineId, contractLine);
    }

    async addContractLine(supplierAddress: string, contractId: number, contractLine: OrderLine): Promise<void> {
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
