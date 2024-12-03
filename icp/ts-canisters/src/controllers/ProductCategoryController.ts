import { IDL, query, update } from "azle";
import { IDLProductCategory } from "../models/idls";
import { ProductCategory } from "../models/types";
import ProductCategoryService from "../services/ProductCategoryService";
import { AtLeastEditor, AtLeastViewer } from "../decorators/roles";

class ProductCategoryController {
    @query([], IDL.Vec(IDLProductCategory))
    @AtLeastViewer
    async getProductCategories(): Promise<ProductCategory[]> {
        return ProductCategoryService.instance.getProductCategories();
    }

    @query([IDL.Nat], IDLProductCategory)
    @AtLeastViewer
    async getProductCategory(id: bigint): Promise<ProductCategory> {
        return ProductCategoryService.instance.getProductCategory(id);
    }

    @update([IDL.Text, IDL.Nat, IDL.Text], IDLProductCategory)
    @AtLeastEditor
    async createProductCategory(
        name: string,
        quality: bigint,
        description: string,
    ): Promise<ProductCategory> {
        return ProductCategoryService.instance.createProductCategory(
            name,
            quality,
            description,
        );
    }

    @update([IDL.Nat, IDL.Text, IDL.Nat, IDL.Text], IDLProductCategory)
    @AtLeastEditor
    async updateProductCategory(
        id: bigint,
        name: string,
        quality: bigint,
        description: string,
    ): Promise<ProductCategory> {
        return ProductCategoryService.instance.updateProductCategory(
            id,
            name,
            quality,
            description,
        );
    }

    @update([IDL.Nat], IDL.Bool)
    @AtLeastEditor
    async deleteProductCategory(id: bigint): Promise<boolean> {
        return ProductCategoryService.instance.deleteProductCategory(id);
    }
}
export default ProductCategoryController;
