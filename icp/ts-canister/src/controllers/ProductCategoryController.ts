import {IDL, query, update} from 'azle';
import {
    ProductCategory as IDLProductCategory,
} from "../models/idls";
import {
    ProductCategory
} from "../models/types";
import ProductCategoryService from "../services/ProductCategoryService";
import {OnlyEditor, OnlyViewer} from "../decorators/roles";

class ProductCategoryController {
    @query([], IDL.Vec(IDLProductCategory))
    @OnlyViewer
    async getProductCategories(): Promise<ProductCategory[]> {
        return ProductCategoryService.instance.getProductCategories();
    }

    @query([IDL.Nat], IDLProductCategory)
    @OnlyViewer
    async getProductCategory(id: bigint): Promise<ProductCategory> {
        return ProductCategoryService.instance.getProductCategory(id);
    }

    @update([IDL.Text, IDL.Nat, IDL.Text], IDLProductCategory)
    @OnlyEditor
    async createProductCategory(name: string, quality: bigint, description: string): Promise<ProductCategory> {
        return ProductCategoryService.instance.createProductCategory(name, quality, description);
    }

    @update([IDL.Nat, IDL.Text, IDL.Nat, IDL.Text], IDLProductCategory)
    @OnlyEditor
    async updateProductCategory(id: bigint, name: string, quality: bigint, description: string): Promise<ProductCategory> {
        return ProductCategoryService.instance.updateProductCategory(id, name, quality, description);
    }
}
export default ProductCategoryController;
