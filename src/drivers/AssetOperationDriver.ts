import { BigNumber, Signer, utils } from 'ethers';
import {
    AssetOperationManager,
    AssetOperationManager__factory, MaterialManager, MaterialManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory,
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { AssetOperation } from '../entities/AssetOperation';

export class AssetOperationDriver {
    private _assetOperationContract: AssetOperationManager;

    private _productCategoryContract: ProductCategoryManager;

    private _materialContract: MaterialManager;

    constructor(
        signer: Signer,
        transformationManagerAddress: string,
        productCategoryManagerAddress: string,
        materialManagerAddress: string,
    ) {
        this._assetOperationContract = AssetOperationManager__factory
            .connect(transformationManagerAddress, signer.provider!)
            .connect(signer);
        this._productCategoryContract = ProductCategoryManager__factory
            .connect(productCategoryManagerAddress, signer.provider!)
            .connect(signer);
        this._materialContract = MaterialManager__factory
            .connect(materialManagerAddress, signer.provider!)
            .connect(signer);
    }

    async getAssetOperationsCounter(): Promise<number> {
        const counter = await this._assetOperationContract.getAssetOperationsCounter();
        return counter.toNumber();
    }

    async getAssetOperationExists(id: number): Promise<boolean> {
        return this._assetOperationContract.getAssetOperationExists(id);
    }

    async getAssetOperation(id: number): Promise<AssetOperation> {
        const assetOperation = await this._assetOperationContract.getAssetOperation(id);
        const inputMaterials = await Promise.all(assetOperation.inputMaterialIds.map((materialId: BigNumber) => this._materialContract.getMaterial(materialId)));
        const inputProductCategories = await Promise.all(inputMaterials.map((material) => this._productCategoryContract.getProductCategory(material.productCategoryId)));
        const outputMaterial = await this._materialContract.getMaterial(assetOperation.outputMaterialId);
        const outputProductCategories = await this._productCategoryContract.getProductCategory(outputMaterial.productCategoryId);

        return EntityBuilder.buildAssetOperation(assetOperation, inputMaterials, inputProductCategories, outputMaterial, outputProductCategories);
    }

    async getAssetOperations(): Promise<AssetOperation[]> {
        const counter: number = await this.getAssetOperationsCounter();

        const promises = [];
        for (let i = 0; i < counter; i++) {
            promises.push(this.getAssetOperation(i));
        }

        return Promise.all(promises);
    }

    async getAssetOperationIds(owner: string): Promise<number[]> {
        const ids = await this._assetOperationContract.getTransformationIds(owner);
        return ids.map((id) => id.toNumber());
    }

    async registerAssetOperation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        if (!utils.isAddress(companyAddress)) {
            throw new Error('Not an address');
        }
        const tx = await this._assetOperationContract.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }

    async updateAssetOperation(id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        const tx = await this._assetOperationContract.updateTransformation(id, name, inputMaterialsIds, outputMaterialId);
        await tx.wait();
    }
}
