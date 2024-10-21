import {RoleProof} from "@kbc-lib/azle-types";
import {ProductCategoryDriver} from "../../drivers/icp/ProductCategoryDriver";
import {ProductCategory} from "../../entities/ProductCategory";

export class ProductCategoryService {
    private readonly _productCategoryDriver: ProductCategoryDriver;

    constructor(productCategoryDriver: ProductCategoryDriver) {
        this._productCategoryDriver = productCategoryDriver;
    }

    async getProductCategories(roleProof: RoleProof): Promise<ProductCategory[]> {
        return this._productCategoryDriver.getProductCategories(roleProof);
    }

    async getProductCategory(roleProof: RoleProof, id: number): Promise<ProductCategory> {
        return this._productCategoryDriver.getProductCategory(roleProof, id);
    }

    async createProductCategory(roleProof: RoleProof, name: string, quality: number, description: string) {
        return this._productCategoryDriver.createProductCategory(roleProof, name, quality, description);
    }

    async updateProductCategory(roleProof: RoleProof, id: number, name: string, quality: number, description: string) {
        return this._productCategoryDriver.updateProductCategory(roleProof, id, name, quality, description);
    }
}
