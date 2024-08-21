import { BigNumber, Event, Signer } from 'ethers';
import { ProductCategoryManager, ProductCategoryManager__factory } from '../smart-contracts';
import { ProductCategory } from '../entities/ProductCategory';
import { EntityBuilder } from '../utils/EntityBuilder';
import { RoleProof } from '../types/RoleProof';

export class ProductCategoryDriver {
    private _contract: ProductCategoryManager;

    constructor(signer: Signer, productCategoryManagerAddress: string) {
        this._contract = ProductCategoryManager__factory.connect(
            productCategoryManagerAddress,
            signer.provider!
        ).connect(signer);
    }

    async getProductCategoryCounter(roleProof: RoleProof): Promise<number> {
        const counter: BigNumber = await this._contract.getProductCategoriesCounter(roleProof);
        return counter.toNumber();
    }

    async getProductCategoryExists(roleProof: RoleProof, id: number): Promise<boolean> {
        return this._contract.getProductCategoryExists(roleProof, id);
    }

    async getProductCategory(roleProof: RoleProof, id: number): Promise<ProductCategory> {
        const result = await this._contract.getProductCategory(roleProof, id);
        return EntityBuilder.buildProductCategory(result);
    }

    async getProductCategories(roleProof: RoleProof): Promise<ProductCategory[]> {
        const counter: number = await this.getProductCategoryCounter(roleProof);

        const promises = [];
        for (let i = 1; i <= counter; i++) {
            promises.push(this.getProductCategory(roleProof, i));
        }

        return Promise.all(promises);
    }

    async registerProductCategory(
        roleProof: RoleProof,
        name: string,
        quality: number,
        description: string
    ): Promise<number> {
        const tx: any = await this._contract.registerProductCategory(
            roleProof,
            name,
            quality,
            description
        );
        const { events } = await tx.wait();

        if (!events) {
            throw new Error('Error during product category registration, no events found');
        }
        return events
            .find((event: Event) => event.event === 'ProductCategoryRegistered')
            .args.id.toNumber();
    }

    async updateProductCategory(
        roleProof: RoleProof,
        id: number,
        name: string,
        quality: number,
        description: string
    ): Promise<void> {
        const tx: any = await this._contract.updateProductCategory(
            roleProof,
            id,
            name,
            quality,
            description
        );
        await tx.wait();
    }
}
