import { Signer, utils } from 'ethers';
import {
    TransformationManager,
    TransformationManager__factory,
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { AssetOperation } from '../entities/AssetOperation.test';

export class TransformationDriver {
    private _contract: TransformationManager;

    constructor(
        signer: Signer,
        transformationManagerAddress: string,
    ) {
        this._contract = TransformationManager__factory
            .connect(transformationManagerAddress, signer.provider!)
            .connect(signer);
    }

    async registerTransformation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._contract.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async updateTransformation(id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        const tx = await this._contract.updateTransformation(id, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async getTransformationsCounter(): Promise<number> {
        const counter = await this._contract.getTransformationsCounter();
        return counter.toNumber();
    }

    async getTransformation(id: number): Promise<AssetOperation> {
        const transformation = await this._contract.getTransformation(id);
        return EntityBuilder.buildTransformation(transformation);
    }

    async getTransformationIds(owner: string): Promise<number[]> {
        const ids = await this._contract.getTransformationIds(owner);
        return ids.map((id) => id.toNumber());
    }
}
