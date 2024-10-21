import {IDL, query, update} from 'azle';
import {
    ProductCategory as IDLProductCategory,
    RoleProof as IDLRoleProof
} from "../models/idls";
import {
    ProductCategory, RoleProof
} from "../models/types";
import ProductCategoryService from "../services/ProductCategoryService";
import {OnlyEditor, OnlyViewer} from "../decorators/roles";

class ProductCategoryController {
    @update([IDLRoleProof], IDL.Vec(IDLProductCategory))
    @OnlyViewer
    async getProductCategories(_: RoleProof): Promise<ProductCategory[]> {
        return ProductCategoryService.instance.getProductCategories();
    }

    @query([IDLRoleProof, IDL.Nat], IDLProductCategory)
    @OnlyViewer
    async getProductCategory(_: RoleProof, id: bigint): Promise<ProductCategory> {
        return ProductCategoryService.instance.getProductCategory(id);
    }

    @update([IDLRoleProof, IDL.Text, IDL.Nat, IDL.Text], IDLProductCategory)
    @OnlyEditor
    async createProductCategory(_: RoleProof, name: string, quality: bigint, description: string): Promise<ProductCategory> {
        return ProductCategoryService.instance.createProductCategory(name, quality, description);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Text, IDL.Nat, IDL.Text], IDLProductCategory)
    @OnlyEditor
    async updateProductCategory(_: RoleProof, id: bigint, name: string, quality: bigint, description: string): Promise<ProductCategory> {
        return ProductCategoryService.instance.updateProductCategory(id, name, quality, description);
    }
}
export default ProductCategoryController;
