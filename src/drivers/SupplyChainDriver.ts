/* eslint-disable camelcase */

import { Signer, utils } from 'ethers';
import { SupplyChainManager__factory, SupplyChainManager } from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from '../entities/Material';
import { Transformation } from '../entities/Transformation';

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

    async registerTransformation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async updateMaterial(companyAddress: string, id: number, name: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateMaterial(companyAddress, id, name);
        await tx.wait();
    }

    async updateTransformation(companyAddress: string, id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.updateTransformation(companyAddress, id, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async getMaterialsCounter(companyAddress: string): Promise<number> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const counter = await this._contract.getMaterialsCounter(companyAddress);
        return counter.toNumber();
    }

    async getTransformationsCounter(companyAddress: string): Promise<number> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const counter = await this._contract.getTransformationsCounter(companyAddress);
        return counter.toNumber();
    }

    async getMaterial(companyAddress: string, id: number): Promise<Material> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const material = await this._contract.getMaterial(companyAddress, id);
        return EntityBuilder.buildMaterial(material);
    }

    async getTransformation(companyAddress: string, id: number): Promise<Transformation> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const transformation = await this._contract.getTransformation(companyAddress, id);
        return EntityBuilder.buildTransformation(transformation);
    }
}
