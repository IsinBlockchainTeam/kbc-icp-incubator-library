import { BigNumber, Event, Signer } from 'ethers';
import {
    ProductCategoryManager,
    ProductCategoryManager__factory,
} from '../smart-contracts';
import { ProductCategory } from '../entities/ProductCategory';
import { EntityBuilder } from '../utils/EntityBuilder';

export class ProductCategoryDriver {
    private _contract: ProductCategoryManager;

    constructor(
        signer: Signer,
        productCategoryManagerAddress: string,
    ) {
        this._contract = ProductCategoryManager__factory
            .connect(productCategoryManagerAddress, signer.provider!)
            .connect(signer);
    }

    async getProductCategoryCounter(): Promise<number> {
        const counter: BigNumber = await this._contract.getProductCategoriesCounter();
        return counter.toNumber();
    }

    async getProductCategoryExists(id: number): Promise<boolean> {
        return this._contract.getProductCategoryExists(id);
    }

    async getProductCategory(id: number): Promise<ProductCategory> {
        const result = await this._contract.getProductCategory(id);
        return EntityBuilder.buildProductCategory(result);
    }

    async getProductCategories(): Promise<ProductCategory[]> {
        const counter: number = await this.getProductCategoryCounter();

        const promises = [];
        for (let i = 0; i < counter; i++) {
            promises.push(this.getProductCategory(i));
        }

        return Promise.all(promises);
    }

    async registerProductCategory(name: string, quality: number, description: string): Promise<ProductCategory> {
        const tx: any = await this._contract.registerProductCategory(name, quality, description);
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during product category registration, no events found');
        }
        const id: number = events.find((event: Event) => event.event === 'ProductCategoryRegistered').args.id.toNumber();
        return this.getProductCategory(id);
    }

    async updateProductCategory(id: number, name: string, quality: number, description: string): Promise<ProductCategory> {
        const tx: any = await this._contract.updateProductCategory(id, name, quality, description);
        await tx.wait();
        return this.getProductCategory(id);
    }
}
