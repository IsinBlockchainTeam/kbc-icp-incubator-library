/* eslint-disable camelcase */

import { Signer, utils } from 'ethers';
import { SupplyChainManager__factory, SupplyChainManager } from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from '../entities/Material';
import { Trade } from '../entities/Trade';
import { Transformation } from '../entities/Transformation';

export class SupplyChainDriver {
    private _supplyChainManager: SupplyChainManager;

    constructor(
        signer: Signer,
        supplyChainManagerAddress: string,
    ) {
        this._supplyChainManager = SupplyChainManager__factory
            .connect(supplyChainManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerMaterial(companyAddress: string, name: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._supplyChainManager.registerMaterial(companyAddress, name);
        await tx.wait();
    }

    async registerTrade(companyAddress: string, name: string, materialsIds: [number, number][]): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._supplyChainManager.registerTrade(companyAddress, name, materialsIds);
        await tx.wait();
    }

    async registerTransformation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._supplyChainManager.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async updateMaterial(companyAddress: string, id: number, name: string): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._supplyChainManager.updateMaterial(companyAddress, id, name);
        await tx.wait();
    }

    async updateTrade(companyAddress: string, id: number, name: string, materialsIds: [number, number][]): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._supplyChainManager.updateTrade(companyAddress, id, name, materialsIds);
        await tx.wait();
    }

    async updateTransformation(companyAddress: string, id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._supplyChainManager.updateTransformation(companyAddress, id, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async getMaterialsCounter(companyAddress: string): Promise<number> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const counter = await this._supplyChainManager.getMaterialsCounter(companyAddress);
        return counter.toNumber();
    }

    async getTradesCounter(companyAddress: string): Promise<number> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const counter = await this._supplyChainManager.getTradesCounter(companyAddress);
        return counter.toNumber();
    }

    async getTransformationsCounter(companyAddress: string): Promise<number> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const counter = await this._supplyChainManager.getTransformationsCounter(companyAddress);
        return counter.toNumber();
    }

    async getMaterial(companyAddress: string, id: number): Promise<Material> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const material = await this._supplyChainManager.getMaterial(companyAddress, id);
        return EntityBuilder.buildMaterial(material);
    }

    async getTrade(companyAddress: string, id: number): Promise<Trade> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const trade = await this._supplyChainManager.getTrade(companyAddress, id);
        return EntityBuilder.buildTrade(trade);
    }

    async getTransformation(companyAddress: string, id: number): Promise<Transformation> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const transformation = await this._supplyChainManager.getTransformation(companyAddress, id);
        return EntityBuilder.buildTransformation(transformation);
    }
}
