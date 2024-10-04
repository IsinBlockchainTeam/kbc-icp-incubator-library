import { IDL, query, update, StableBTreeMap } from 'azle';
import { Material } from './models/Material';
import { CANISTER } from './constants/canister';
import { ProductCategoryManagerMethods } from './ProductCategoryManager';

class MaterialManager {
    productCategoryManagerCanisterId: string = CANISTER.PRODUCT_CATEGORY_MANAGER_ID();

    materials = StableBTreeMap<bigint, Material>(0);

    @query([IDL.Nat], IDL.Opt(Material))
    getMaterial(id: bigint): [Material] | [] {
        const result = this.materials.get(id);
        return result ? [result] : [];
    }

    @query([], IDL.Vec(Material))
    getMaterials(): Material[] {
        return this.materials.values();
    }

    @update([IDL.Nat], Material)
    async registerMaterial(productCategoryId: number): Promise<Material> {
        if (!(await this.productCategoryExists(productCategoryId))) {
            throw new Error('Product category not found');
        }
        const id = this.materials.keys().length;
        const material: Material = { id, productCategoryId };
        this.materials.insert(BigInt(id), material);
        return material;
    }

    @update([IDL.Nat, IDL.Nat], Material)
    async updateMaterial(id: bigint, productCategoryId: number): Promise<Material> {
        const material = this.materials.get(id);
        if (!material) {
            throw new Error('Material not found');
        }
        if (!(await this.productCategoryExists(productCategoryId))) {
            throw new Error('Product category not found');
        }
        material.productCategoryId = productCategoryId;
        this.materials.insert(BigInt(id), material);
        return material;
    }

    async productCategoryExists(productCategoryId: number): Promise<boolean> {
        const productCategory = await ProductCategoryManagerMethods.getProductCategory(productCategoryId);
        return productCategory.length > 0;
    }
}

export default MaterialManager;
