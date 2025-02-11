import { IDL, query, update } from "azle";
import { IDLProductCategory } from "../models/idls";
import { ProductCategory } from "../models/types";
import ProductCategoryService from "../services/ProductCategoryService";
import { AtLeastViewer, OnlyController} from "../decorators/roles";

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

    @update([IDL.Text], IDLProductCategory)
    @OnlyController
    async createProductCategory(name: string): Promise<ProductCategory> {
        return ProductCategoryService.instance.createProductCategory(name);
    }

    @update([IDL.Nat, IDL.Text], IDLProductCategory)
    @OnlyController
    async updateProductCategory(id: bigint, name: string): Promise<ProductCategory> {
        return ProductCategoryService.instance.updateProductCategory(id, name);
    }

    @update([IDL.Nat], IDL.Bool)
    @OnlyController
    async deleteProductCategory(id: bigint): Promise<boolean> {
        return ProductCategoryService.instance.deleteProductCategory(id);
    }
}
export default ProductCategoryController;
