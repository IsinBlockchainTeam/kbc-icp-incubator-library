import { call, caller, IDL, query, StableBTreeMap, update } from 'azle';
import { ethers } from 'ethers';
import { OnlyViewer } from './decorators/roles';
import { ProductCategory } from './models/ProductCategory';
import { RoleProof } from './models/Proof';
import { CANISTER } from './constants/canister';

export const ProductCategoryManagerMethods = {
    getProductCategory: async (id: number) =>
        call(CANISTER.PRODUCT_CATEGORY_MANAGER_ID(), 'getProductCategory', {
            paramIdlTypes: [IDL.Nat],
            returnIdlType: IDL.Opt(ProductCategory),
            args: [id]
        })
};

class ProductCategoryManager {
    productCategories = StableBTreeMap<bigint, ProductCategory>(0);

    @query([IDL.Nat], IDL.Opt(ProductCategory))
    getProductCategory(id: bigint): [ProductCategory] | [] {
        const result = this.productCategories.get(id);
        return result ? [result] : [];
    }

    @query([], IDL.Vec(ProductCategory))
    getProductCategories(): ProductCategory[] {
        return this.productCategories.values();
    }

    @update([IDL.Text, IDL.Nat, IDL.Text], ProductCategory)
    registerProductCategory(name: string, quality: number, description: string): ProductCategory {
        const id = this.productCategories.keys().length;
        const productCategory: ProductCategory = { id, name, quality, description };
        this.productCategories.insert(BigInt(id), productCategory);
        return productCategory;
    }

    @update([IDL.Nat, IDL.Text, IDL.Nat, IDL.Text], ProductCategory)
    updateProductCategory(id: bigint, name: string, quality: number, description: string): ProductCategory {
        const productCategory = this.productCategories.get(id);
        if (!productCategory) {
            throw new Error('Product category not found');
        }
        productCategory.name = name;
        productCategory.quality = quality;
        productCategory.description = description;
        this.productCategories.insert(BigInt(id), productCategory);
        return productCategory;
    }

    @update([RoleProof], IDL.Text)
    @OnlyViewer
    async whoAmI(): Promise<string> {
        return caller().toString();
    }

    @query([IDL.Text, IDL.Text], IDL.Text)
    verifyMessage(message: string, signature: string): string {
        try {
            return ethers.verifyMessage(message, signature);
        } catch (error) {
            return '';
        }
    }
}
export default ProductCategoryManager;
