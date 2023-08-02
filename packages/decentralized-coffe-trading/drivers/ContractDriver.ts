/* eslint-disable camelcase */
/* eslint-disable no-plusplus */
/* eslint-disable no-await-in-loop */
import { JsonRpcProvider } from '@ethersproject/providers';
import { IdentityEthersDriver } from '@blockchain-lib/common';
import { BigNumber, utils } from 'ethers';
import { ContractManager, ContractManager__factory } from '../smart-contracts';
import { Contract } from '../entities/Contract';
import { ContractLine } from '../entities/ContractLine';
import { ContractStatus } from '../types/ContractStatus';

export class ContractDriver {
    protected _contract: ContractManager;

    constructor(
        identityDriver: IdentityEthersDriver,
        provider: JsonRpcProvider,
        contractAddress: string,
    ) {
        this._contract = ContractManager__factory
            .connect(contractAddress, provider)
            .connect(identityDriver.wallet);
    }

    async registerContract(contract: Contract): Promise<void> {
        if (!utils.isAddress(contract.customer)) {
            throw new Error('Customer not an address');
        }

        try {
            const tx = await this._contract.registerContract(
                contract.supplier,
                contract.customer,
                contract.offeree,
                contract.externalUrl,
            );
            const receipt = await tx.wait();
            if (receipt.events) {
                const registerEvent = receipt.events.find((event) => event.event === 'ContractRegistered');
                if (registerEvent) {
                    const decodedEvent = this._contract.interface.decodeEventLog('ContractRegistered', registerEvent.data, registerEvent.topics);
                    const savedContractId = decodedEvent.id.toNumber();
                    for (let i = 0; i < contract.lines.length; i++) {
                        const contractLine = contract.lines[i];
                        await this.addContractLine(contract.supplier, savedContractId, contractLine);
                    }
                }
            }
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async getContractCounter(supplierAddress: string): Promise<number> {
        const counter = await this._contract.getContractCounter(supplierAddress);
        return counter.toNumber();
    }

    async getContractInfo(supplierAddress: string, id: number): Promise<Contract> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
        try {
            const {
                id: contractId,
                supplier,
                customer,
                offeree,
                offeror,
                externalUrl,
                lineIds,
            } = await this._contract.getContractInfo(supplierAddress, id);
            // const lines: ContractLine[] = (rawLines || []).map((rcl) => new ContractLine(
            //     rcl.id.toNumber(),
            //     rcl.productCategory.toString(),
            //     rcl.quantity.toNumber(),
            //     {
            //         amount: rcl.price.amount.toNumber() / BigNumber.from(10)
            //             .pow(rcl.price.decimals)
            //             .toNumber(),
            //         fiat: rcl.price.fiat,
            //     },
            // ));
            return new Contract(contractId.toNumber(), supplier, customer, externalUrl, offeree, offeror, lineIds.map((l) => l.toNumber()));
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async isSupplierOrCustomer(supplierAddress: string, contractId: number, senderAddress: string): Promise<boolean> {
        if (!utils.isAddress(supplierAddress)) { throw new Error('Supplier not an address'); }
        if (!utils.isAddress(senderAddress)) { throw new Error('Sender not an address'); }
        return this._contract.isSupplierOrCustomer(supplierAddress, contractId, senderAddress);
    }

    async getContractStatus(supplierAddress: string, contractId: number): Promise<ContractStatus> {
        if (!utils.isAddress(supplierAddress)) { throw new Error('Not an address'); }
        return this._contract.getContractStatus(supplierAddress, contractId);
    }

    async contractExists(supplierAddress: string, contractId: number): Promise<boolean> {
        return this._contract.contractExists(supplierAddress, contractId);
    }

    async confirmContract(supplierAddress: string, contractId: number): Promise<void> {
        await this._contract.confirmContract(supplierAddress, contractId);
    }

    async getContractLine(supplierAddress: string, contractId: number, contractLineId: number): Promise<ContractLine> {
        if (!utils.isAddress(supplierAddress)) {
            throw new Error('Not an address');
        }
        try {
            const rawContractLine = await this._contract.getContractLine(supplierAddress, contractId, contractLineId);
            return new ContractLine(
                rawContractLine.id.toNumber(),
                rawContractLine.productCategory.toString(),
                rawContractLine.quantity.toNumber(),
                {
                    amount: rawContractLine.price.amount.toNumber() / BigNumber.from(10)
                        .pow(rawContractLine.price.decimals)
                        .toNumber(),
                    fiat: rawContractLine.price.fiat,
                },
            );
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addContractLine(supplierAddress: string, contractId: number, contractLine: ContractLine): Promise<void> {
        try {
            const priceDecimals = contractLine.price.amount.toString().split('.')[1]?.length || 0;
            const rawContractLine: ContractManager.ContractLineStruct = {
                id: 0,
                productCategory: contractLine.productCategory,
                quantity: contractLine.quantity,
                price: {
                    amount: contractLine.price.amount * (10 ** priceDecimals),
                    decimals: priceDecimals,
                    fiat: contractLine.price.fiat,
                },
                exists: true,
            };
            const tx = await this._contract.addContractLine(
                supplierAddress,
                contractId,
                rawContractLine,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async updateContractLine(supplierAddress: string, contractId: number, contractLineId: number, contractLine: ContractLine): Promise<void> {
        try {
            const priceDecimals = contractLine.price.amount.toString().split('.')[1]?.length || 0;
            const rawContractLine: ContractManager.ContractLineStruct = {
                id: 0,
                productCategory: contractLine.productCategory,
                quantity: contractLine.quantity,
                price: {
                    amount: contractLine.price.amount * (10 ** priceDecimals),
                    decimals: priceDecimals,
                    fiat: contractLine.price.fiat,
                },
                exists: true,
            };
            const tx = await this._contract.updateContractLine(
                supplierAddress,
                contractId,
                contractLineId,
                rawContractLine,
            );
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async addAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) {
            throw new Error('Not an address');
        }
        try {
            const tx = await this._contract.addAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }

    async removeAdmin(address: string): Promise<void> {
        if (!utils.isAddress(address)) {
            throw new Error('Not an address');
        }
        try {
            const tx = await this._contract.removeAdmin(address);
            await tx.wait();
        } catch (e: any) {
            throw new Error(e.message);
        }
    }
}
