import { ProductCategoryDriver } from '../drivers/ProductCategoryDriver';
import { ProductCategory } from '../entities/ProductCategory';

export class ProductCategoryService {
    private readonly _productCategoryDriver: ProductCategoryDriver;

    constructor(productCategoryDriver: ProductCategoryDriver) {
        this._productCategoryDriver = productCategoryDriver;
    }

    async getProductCategories(): Promise<ProductCategory[]> {
        return this._productCategoryDriver.getProductCategories();
    }

    async getProductCategory(id: number): Promise<ProductCategory> {
        return this._productCategoryDriver.getProductCategory(id);
    }

    async createProductCategory(name: string, quality: number, description: string) {
        return this._productCategoryDriver.createProductCategory(name, quality, description);
    }

    async updateProductCategory(id: number, name: string, quality: number, description: string) {
        return this._productCategoryDriver.updateProductCategory(id, name, quality, description);
    }
}
