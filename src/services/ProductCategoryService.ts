import {ProductCategoryDriver} from "../drivers/ProductCategoryDriver";
import {ProductCategory} from "../entities/ProductCategory";

export class ProductCategoryService {
    private _productCategoryDriver: ProductCategoryDriver;

    constructor(productCategoryDriver: ProductCategoryDriver) {
        this._productCategoryDriver = productCategoryDriver;
    }

    async getProductCategoryCounter(): Promise<number> {
        return this._productCategoryDriver.getProductCategoryCounter();
    }

    async getProductCategoryExists(id: number): Promise<boolean> {
        return this._productCategoryDriver.getProductCategoryExists(id);
    }

    async getProductCategory(id: number): Promise<ProductCategory> {
        return this._productCategoryDriver.getProductCategory(id);
    }

    async getProductCategories(): Promise<ProductCategory[]> {
        return this._productCategoryDriver.getProductCategories();
    }

    async registerProductCategory(name: string, quality: number, description: string): Promise<ProductCategory> {
        return this._productCategoryDriver.registerProductCategory(name, quality, description);
    }

    async updateProductCategory(id: number, name: string, quality: number, description: string): Promise<ProductCategory> {
        return this._productCategoryDriver.updateProductCategory(id, name, quality, description);
    }
}