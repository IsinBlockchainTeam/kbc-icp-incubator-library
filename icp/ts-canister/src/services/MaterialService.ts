import {StableBTreeMap} from "azle";
import {Material} from "../models/types";
import ProductCategoryService from "./ProductCategoryService";
import {StableMemoryId} from "../utils/stableMemory";

class MaterialService {
    private static _instance: MaterialService;
    private _materials = StableBTreeMap<bigint, Material>(StableMemoryId.MATERIALS);
    private _productCategoryService = ProductCategoryService.instance;

    private constructor() {}
    static get instance() {
        if (!MaterialService._instance) {
            MaterialService._instance = new MaterialService();
        }
        return MaterialService._instance;
    }

    getMaterials(): Material[] {
        return this._materials.values();
    }

    getMaterial(id: bigint): Material {
        const result = this._materials.get(id);
        if(result) {
            return result;
        }
        throw new Error('Material not found');
    }

    createMaterial(productCategoryId: bigint): Material {
        if (!this._productCategoryService.productCategoryExists(productCategoryId)) {
            throw new Error('Product category not found');
        }
        const productCategory = this._productCategoryService.getProductCategory(productCategoryId);
        const id = BigInt(this._materials.keys().length);
        const material: Material = { id, productCategory };
        this._materials.insert(id, material);
        return material;
    }

    updateMaterial(id: bigint, productCategoryId: bigint): Material {
        const material = this.getMaterial(id);
        if (!this._productCategoryService.productCategoryExists(productCategoryId)) {
            throw new Error('Product category not found');
        }
        material.productCategory = this._productCategoryService.getProductCategory(productCategoryId);
        this._materials.insert(id, material);
        return material;
    }
}
export default MaterialService;
