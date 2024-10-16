import {IDL, query, update} from 'azle';
import {ProductCategory} from "../models/ProductCategory";
import {RoleProof} from "../models/Proof";
import ProductCategoryService from "../services/ProductCategoryService";
import {OnlyViewer} from "../decorators/roles";

class ProductCategoryController {
    @query([IDL.Nat], IDL.Opt(ProductCategory))
    getProductCategory(id: bigint): [ProductCategory] | [] {
        return ProductCategoryService.instance.getProductCategory(id);
    }

    @query([], IDL.Vec(ProductCategory))
    getProductCategories(): ProductCategory[] {
        return ProductCategoryService.instance.getProductCategories();
    }

    @update([IDL.Text, IDL.Nat, IDL.Text], ProductCategory)
    registerProductCategory(name: string, quality: bigint, description: string): ProductCategory {
        return ProductCategoryService.instance.registerProductCategory(name, quality, description);
    }

    @update([IDL.Nat, IDL.Text, IDL.Nat, IDL.Text], ProductCategory)
    updateProductCategory(id: bigint, name: string, quality: bigint, description: string): ProductCategory {
        return ProductCategoryService.instance.updateProductCategory(id, name, quality, description);
    }

    @update([RoleProof], IDL.Text)
    @OnlyViewer
    async whoAmI(): Promise<string> {
        return ProductCategoryService.instance.whoAmI();
    }

    @query([IDL.Text, IDL.Text], IDL.Text)
    verifyMessage(message: string, signature: string): string {
        return ProductCategoryService.instance.verifyMessage(message, signature);
    }
}
export default ProductCategoryController;
