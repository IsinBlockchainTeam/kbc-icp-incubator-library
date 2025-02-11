import {StableBTreeMap} from "azle";
import {Material} from "../models/types";
import ProductCategoryService from "./ProductCategoryService";
import {StableMemoryId} from "../utils/stableMemory";
import {MaterialNotFoundError, ProductCategoryNotFoundError} from "../models/errors";
import AuthenticationService from "./AuthenticationService";
import {HasInterestedParties} from "./interfaces/HasInterestedParties";

class MaterialService implements HasInterestedParties{
    private static _instance: MaterialService;

    private _materials = StableBTreeMap<bigint, Material>(StableMemoryId.MATERIALS);

    private _productCategoryService = ProductCategoryService.instance;

    static get instance() {
        if (!MaterialService._instance) {
            MaterialService._instance = new MaterialService();
        }
        return MaterialService._instance;
    }

    getInterestedParties(entityId: bigint): string[] {
        const result = this.getMaterial(entityId);
        return [result.owner];
    }

    getMaterials(): Material[] {
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        return this._materials.values().filter((order) => order.owner === delegatorAddress);
    }

    getMaterial(id: bigint): Material {
        const result = this._materials.get(id);
        if (result) {
            return result;
        }
        throw new MaterialNotFoundError();
    }

    createMaterial(name: string, productCategoryId: bigint, typology: string, quality: string, moisture: string, isInput: boolean): Material {
        if (!this._productCategoryService.productCategoryExists(productCategoryId)) {
            throw new ProductCategoryNotFoundError();
        }
        const productCategory = this._productCategoryService.getProductCategory(productCategoryId);
        const id = BigInt(this._materials.keys().length);
        const delegatorAddress = AuthenticationService.instance.getDelegatorAddress();
        const material: Material = { id, owner: delegatorAddress, name, productCategory, typology, quality, moisture, isInput };
        this._materials.insert(id, material);
        return material;
    }

    updateMaterial(id: bigint, name: string, productCategoryId: bigint, typology: string, quality: string, moisture: string, isInput: boolean): Material {
        const material = this.getMaterial(id);
        if (!this._productCategoryService.productCategoryExists(productCategoryId)) {
            throw new ProductCategoryNotFoundError();
        }
        material.name = name;
        material.productCategory = this._productCategoryService.getProductCategory(productCategoryId);
        material.typology = typology;
        material.quality = quality;
        material.moisture = moisture;
        material.isInput = isInput;
        this._materials.insert(id, material);
        return material;
    }

    materialExists(id: bigint): boolean {
        const result = this._materials.get(id);
        return !!result;
    }
}
export default MaterialService;
