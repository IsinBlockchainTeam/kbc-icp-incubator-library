import { StableBTreeMap } from "azle";
import { ProductCategory } from "../models/types";
import { StableMemoryId } from "../utils/stableMemory";
import {ProductCategoryNotFoundError} from "../models/errors";

class ProductCategoryService {
    private static _instance: ProductCategoryService;

    private _productCategories = StableBTreeMap<bigint, ProductCategory>(StableMemoryId.PRODUCT_CATEGORIES);

    static get instance() {
        if (!ProductCategoryService._instance) {
            ProductCategoryService._instance = new ProductCategoryService();
        }
        return ProductCategoryService._instance;
    }

    getProductCategories(): ProductCategory[] {
        return this._productCategories.values();
    }

    getProductCategory(id: bigint): ProductCategory {
        const result = this._productCategories.get(id);
        if (result) {
            return result;
        }
        throw new ProductCategoryNotFoundError();
    }

    productCategoryExists(id: bigint): boolean {
        const result = this._productCategories.get(id);
        return !!result;
    }

    createProductCategory(name: string): ProductCategory {
        const id = BigInt(this._productCategories.keys().length);
        const productCategory: ProductCategory = { id, name };
        this._productCategories.insert(id, productCategory);
        return productCategory;
    }

    updateProductCategory(id: bigint, name: string): ProductCategory {
        const productCategory = this.getProductCategory(id);
        productCategory.name = name;
        this._productCategories.insert(id, productCategory);
        return productCategory;
    }

    deleteProductCategory(id: bigint): boolean {
        const productCategory = this.getProductCategory(id);
        if (!productCategory) {
            throw new Error("Product category not found");
        }

        this._productCategories.remove(id);

        return true;
    }
}
export default ProductCategoryService;
