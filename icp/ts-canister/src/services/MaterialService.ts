import {StableBTreeMap} from "azle";
import {Material} from "../models/Material";
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

    getMaterial(id: bigint): [Material] | [] {
        const result = this._materials.get(id);
        return result ? [result] : [];
    }

    getMaterials(): Material[] {
        return this._materials.values();
    }

    registerMaterial(productCategoryId: bigint): Material {
        if (!this.productCategoryExists(productCategoryId)) {
            throw new Error('Product category not found');
        }
        const id = BigInt(this._materials.keys().length);
        const material: Material = { id, productCategoryId };
        this._materials.insert(id, material);
        return material;
    }

    updateMaterial(id: bigint, productCategoryId: bigint): Material {
        const material = this._materials.get(id);
        if (!material) {
            throw new Error('Material not found');
        }
        if (!this.productCategoryExists(productCategoryId)) {
            throw new Error('Product category not found');
        }
        material.productCategoryId = productCategoryId;
        this._materials.insert(id, material);
        return material;
    }

    productCategoryExists(productCategoryId: bigint): boolean {
        return this._productCategoryService.getProductCategory(productCategoryId).length > 0;
    }
}
export default MaterialService;
