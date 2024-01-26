import { BigNumber, Event, Signer } from 'ethers';
import {
    MaterialManager,
    MaterialManager__factory,
    ProductCategoryManager, ProductCategoryManager__factory,
} from '../smart-contracts';
import { EntityBuilder } from '../utils/EntityBuilder';
import { Material } from '../entities/Material';

export class MaterialDriver {
    private _materialContract: MaterialManager;

    private _productCategoryContract: ProductCategoryManager;

    constructor(
        signer: Signer,
        materialManagerAddress: string,
        productCategoryManagerAddress: string,
    ) {
        this._materialContract = MaterialManager__factory
            .connect(materialManagerAddress, signer.provider!)
            .connect(signer);
        this._productCategoryContract = ProductCategoryManager__factory
            .connect(productCategoryManagerAddress, signer.provider!)
            .connect(signer);
    }

    async getMaterialsCounter(): Promise<number> {
        const counter = await this._materialContract.getMaterialsCounter();
        return counter.toNumber();
    }

    async getMaterialExists(id: number): Promise<boolean> {
        return this._materialContract.getMaterialExists(id);
    }

    async getMaterial(id: number): Promise<Material> {
        const material = await this._materialContract.getMaterial(id);
        const productCategory = await this._productCategoryContract.getProductCategory(material.productCategoryId);
        return EntityBuilder.buildMaterial(material, productCategory);
    }

    async getMaterials(): Promise<Material[]> {
        const counter: number = await this.getMaterialsCounter();

        const promises = [];
        for (let i = 0; i < counter; i++) {
            promises.push(this.getMaterial(i));
        }

        return Promise.all(promises);
    }

    async getMaterialsOfCreator(creator: string): Promise<Material[]> {
        const ids: number[] = (await this._materialContract.getMaterialIdsOfCreator(creator)).map((id: BigNumber) => id.toNumber());

        const promises = ids.map((id: number) => this.getMaterial(id));

        return Promise.all(promises);
    }

    async registerMaterial(productCategoryId: number): Promise<Material> {
        const tx: any = await this._materialContract.registerMaterial(productCategoryId);
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during material registration, no events found');
        }
        const id: number = events.find((event: Event) => event.event === 'MaterialRegistered').args.id.toNumber();
        return this.getMaterial(id);
    }

    async updateMaterial(id: number, productCategoryId: number): Promise<Material> {
        const tx: any = await this._materialContract.updateMaterial(id, productCategoryId);
        await tx.wait();
        return this.getMaterial(id);
    }
}
