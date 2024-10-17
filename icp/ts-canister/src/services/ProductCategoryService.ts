import { caller, StableBTreeMap } from 'azle';
import { ethers } from 'ethers';
import { ProductCategory } from '../models/ProductCategory';
import { StableMemoryId } from '../utils/stableMemory';

class ProductCategoryService {
    private static _instance: ProductCategoryService;

    private _productCategories = StableBTreeMap<bigint, ProductCategory>(StableMemoryId.PRODUCT_CATEGORIES);

    static get instance() {
        if (!ProductCategoryService._instance) {
            ProductCategoryService._instance = new ProductCategoryService();
        }
        return ProductCategoryService._instance;
    }

    getProductCategory(id: bigint): [ProductCategory] | [] {
        const result = this._productCategories.get(id);
        return result ? [result] : [];
    }

    getProductCategories(): ProductCategory[] {
        return this._productCategories.values();
    }

    registerProductCategory(name: string, quality: bigint, description: string): ProductCategory {
        const id = BigInt(this._productCategories.keys().length);
        const productCategory: ProductCategory = { id, name, quality, description };
        this._productCategories.insert(id, productCategory);
        return productCategory;
    }

    updateProductCategory(id: bigint, name: string, quality: bigint, description: string): ProductCategory {
        const productCategory = this._productCategories.get(id);
        if (!productCategory) {
            throw new Error('Product category not found');
        }
        productCategory.name = name;
        productCategory.quality = quality;
        productCategory.description = description;
        this._productCategories.insert(id, productCategory);
        return productCategory;
    }

    async whoAmI(): Promise<string> {
        return caller().toString();
    }

    verifyMessage(message: string, signature: string): string {
        try {
            return ethers.verifyMessage(message, signature);
        } catch (error) {
            return '';
        }
    }
}
export default ProductCategoryService;
