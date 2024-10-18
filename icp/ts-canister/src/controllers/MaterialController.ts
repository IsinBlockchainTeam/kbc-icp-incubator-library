import { IDL, query, update } from 'azle';
import {
    Material as IDLMaterial
} from "../models/idls";
import {
    Material
} from "../models/types";
import MaterialService from "../services/MaterialService";

class MaterialController {
    @query([IDL.Nat], IDL.Opt(IDLMaterial))
    getMaterial(id: bigint): [Material] | [] {
        return MaterialService.instance.getMaterial(id);
    }

    @query([], IDL.Vec(IDLMaterial))
    getMaterials(): Material[] {
        return MaterialService.instance.getMaterials();
    }

    @update([IDL.Nat], IDLMaterial)
    async registerMaterial(productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.registerMaterial(productCategoryId);
    }

    @update([IDL.Nat, IDL.Nat], IDLMaterial)
    async updateMaterial(id: bigint, productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.updateMaterial(id, productCategoryId);
    }
}

export default MaterialController;
