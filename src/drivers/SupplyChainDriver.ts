/* eslint-disable camelcase */

import { Signer, utils } from 'ethers';
import { SupplyChainManager__factory, SupplyChainManager } from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from '../entities/Material';

export class SupplyChainDriver {
    private _contract: SupplyChainManager;

    constructor(
        signer: Signer,
        supplyChainManagerAddress: string,
    ) {
        this._contract = SupplyChainManager__factory
            .connect(supplyChainManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerMaterial(companyAddress: string, name: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerMaterial(companyAddress, name);
        await tx.wait();
    }

    async updateMaterial(id: number, name: string): Promise<void> {
        const tx = await this._contract.updateMaterial(id, name);
        await tx.wait();
    }

    async getMaterialsCounter(): Promise<number> {
        const counter = await this._contract.getMaterialsCounter();
        return counter.toNumber();
    }

    async getMaterial(id: number): Promise<Material> {
        const material = await this._contract.getMaterial(id);
        return EntityBuilder.buildMaterial(material);
    }

    async getMaterialIds(owner: string): Promise<number[]> {
        const ids = await this._contract.getMaterialIds(owner);
        return ids.map((id) => id.toNumber());
    }
}
