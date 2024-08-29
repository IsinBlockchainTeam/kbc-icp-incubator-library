import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
import { ProductCategory } from '../entities/ProductCategory';
import { RoleProof } from '../types/RoleProof';

export class ProductCategoryService {
    private _productCategoryDriver: ProductCategoryDriver;

    constructor(productCategoryDriver: ProductCategoryDriver) {
        this._productCategoryDriver = productCategoryDriver;
    }

    async getProductCategoryCounter(roleProof: RoleProof): Promise<number> {
        return this._productCategoryDriver.getProductCategoryCounter(roleProof);
    }

    async getProductCategoryExists(roleProof: RoleProof, id: number): Promise<boolean> {
        return this._productCategoryDriver.getProductCategoryExists(roleProof, id);
    }

    async getProductCategory(roleProof: RoleProof, id: number): Promise<ProductCategory> {
        return this._productCategoryDriver.getProductCategory(roleProof, id);
    }

    async getProductCategories(roleProof: RoleProof): Promise<ProductCategory[]> {
        return this._productCategoryDriver.getProductCategories(roleProof);
    }

    async registerProductCategory(
        roleProof: RoleProof,
        name: string,
        quality: number,
        description: string
    ): Promise<number> {
        return this._productCategoryDriver.registerProductCategory(
            roleProof,
            name,
            quality,
            description
        );
    }

    async updateProductCategory(
        roleProof: RoleProof,
        id: number,
        name: string,
        quality: number,
        description: string
    ): Promise<void> {
        return this._productCategoryDriver.updateProductCategory(
            roleProof,
            id,
            name,
            quality,
            description
        );
    }
}
