import { IDL, query, update } from 'azle';
import {Material} from "../models/Material";
import MaterialService from "../services/MaterialService";

class MaterialController {
    @query([IDL.Nat], IDL.Opt(Material))
    getMaterial(id: bigint): [Material] | [] {
        return MaterialService.instance.getMaterial(id);
    }

    @query([], IDL.Vec(Material))
    getMaterials(): Material[] {
        return MaterialService.instance.getMaterials();
    }

    @update([IDL.Nat], Material)
    async registerMaterial(productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.registerMaterial(productCategoryId);
    }

    @update([IDL.Nat, IDL.Nat], Material)
    async updateMaterial(id: bigint, productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.updateMaterial(id, productCategoryId);
    }
}

export default MaterialController;
