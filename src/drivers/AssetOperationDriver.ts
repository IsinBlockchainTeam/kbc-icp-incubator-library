import { BigNumber, Event, Signer } from 'ethers';
import {
    AssetOperationManager,
    AssetOperationManager__factory,
    MaterialManager,
    MaterialManager__factory,
    ProductCategoryManager,
    ProductCategoryManager__factory
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { AssetOperation } from '../entities/AssetOperation';
import { AssetOperationType } from '../types/AssetOperationType';
import { RoleProof } from '../types/RoleProof';

export class AssetOperationDriver {
    private _assetOperationContract: AssetOperationManager;

    private _productCategoryContract: ProductCategoryManager;

    private _materialContract: MaterialManager;

    constructor(
        signer: Signer,
        assetOperationManagerAddress: string,
        materialManagerAddress: string,
        productCategoryManagerAddress: string
    ) {
        this._assetOperationContract = AssetOperationManager__factory.connect(
            assetOperationManagerAddress,
            signer.provider!
        ).connect(signer);
        this._materialContract = MaterialManager__factory.connect(
            materialManagerAddress,
            signer.provider!
        ).connect(signer);
        this._productCategoryContract = ProductCategoryManager__factory.connect(
            productCategoryManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async getAssetOperationsCounter(roleProof: RoleProof): Promise<number> {
        const counter = await this._assetOperationContract.getAssetOperationsCounter(roleProof);
        return counter.toNumber();
    }

    async getAssetOperationExists(roleProof: RoleProof, id: number): Promise<boolean> {
        return this._assetOperationContract.getAssetOperationExists(roleProof, id);
    }

    async getAssetOperation(roleProof: RoleProof, id: number): Promise<AssetOperation> {
        const assetOperation = await this._assetOperationContract.getAssetOperation(roleProof, id);
        const inputMaterials = await Promise.all(
            assetOperation.inputMaterialIds.map((materialId: BigNumber) =>
                this._materialContract.getMaterial(roleProof, materialId)
            )
        );
        const inputProductCategories = await Promise.all(
            inputMaterials.map((material) =>
                this._productCategoryContract.getProductCategory(
                    roleProof,
                    material.productCategoryId
                )
            )
        );
        const outputMaterial = await this._materialContract.getMaterial(
            roleProof,
            assetOperation.outputMaterialId
        );
        const outputProductCategories = await this._productCategoryContract.getProductCategory(
            roleProof,
            outputMaterial.productCategoryId
        );

        return EntityBuilder.buildAssetOperation(
            assetOperation,
            inputMaterials,
            inputProductCategories,
            outputMaterial,
            outputProductCategories
        );
    }

    async getAssetOperations(roleProof: RoleProof): Promise<AssetOperation[]> {
        const counter: number = await this.getAssetOperationsCounter(roleProof);

        const promises = [];
        for (let i = 1; i <= counter; i++) {
            promises.push(this.getAssetOperation(roleProof, i));
        }

        return Promise.all(promises);
    }

    async getAssetOperationType(roleProof: RoleProof, id: number): Promise<AssetOperationType> {
        const result: number = await this._assetOperationContract.getAssetOperationType(
            roleProof,
            id
        );
        switch (result) {
            case 0:
                return AssetOperationType.CONSOLIDATION;
            case 1:
                return AssetOperationType.TRANSFORMATION;
            default:
                throw new Error(
                    `AssetOperationDriver: an invalid value "${result}" for "AssetOperationType" was returned by the contract`
                );
        }
    }

    async getAssetOperationsOfCreator(
        roleProof: RoleProof,
        creator: string
    ): Promise<AssetOperation[]> {
        const ids: number[] = (
            await this._assetOperationContract.getAssetOperationIdsOfCreator(roleProof, creator)
        ).map((id: BigNumber) => id.toNumber());

        const promises = ids.map((id: number) => this.getAssetOperation(roleProof, id));

        return Promise.all(promises);
    }

    async getAssetOperationsByOutputMaterial(
        roleProof: RoleProof,
        materialId: number
    ): Promise<AssetOperation[]> {
        const assetOperations: AssetOperation[] = await this.getAssetOperations(roleProof);
        return assetOperations.filter(
            (assetOperation: AssetOperation) => assetOperation.outputMaterial.id === materialId
        );
    }

    async registerAssetOperation(
        roleProof: RoleProof,
        name: string,
        inputMaterialsIds: number[],
        outputMaterialId: number,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ): Promise<number> {
        const tx: any = await this._assetOperationContract.registerAssetOperation(
            roleProof,
            name,
            inputMaterialsIds,
            outputMaterialId,
            latitude,
            longitude,
            processTypes
        );
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during asset operation registration, no events found');
        }
        return events
            .find((event: Event) => event.event === 'AssetOperationRegistered')
            .args.id.toNumber();
    }

    async updateAssetOperation(
        roleProof: RoleProof,
        id: number,
        name: string,
        inputMaterialsIds: number[],
        outputMaterialId: number,
        latitude: string,
        longitude: string,
        processTypes: string[]
    ): Promise<void> {
        const tx = await this._assetOperationContract.updateAssetOperation(
            roleProof,
            id,
            name,
            inputMaterialsIds,
            outputMaterialId,
            latitude,
            longitude,
            processTypes
        );
        await tx.wait();
    }
}
