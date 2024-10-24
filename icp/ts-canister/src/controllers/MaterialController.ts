import { IDL, query, update } from 'azle';
import {
    Material as IDLMaterial,
} from "../models/idls";
import {
    Material, RoleProof
} from "../models/types";
import MaterialService from "../services/MaterialService";
import {OnlyEditor, OnlyViewer} from "../decorators/roles";

class MaterialController {
    @query([], IDL.Vec(IDLMaterial))
    @OnlyViewer
    async getMaterials(): Promise<Material[]> {
        return MaterialService.instance.getMaterials();
    }

    @query([IDL.Nat], IDLMaterial)
    @OnlyViewer
    async getMaterial(id: bigint): Promise<Material> {
        return MaterialService.instance.getMaterial(id);
    }

    @update([IDL.Nat], IDLMaterial)
    @OnlyEditor
    async createMaterial(productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.createMaterial(productCategoryId);
    }

    @update([IDL.Nat, IDL.Nat], IDLMaterial)
    @OnlyEditor
    async updateMaterial(id: bigint, productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.updateMaterial(id, productCategoryId);
    }
}

export default MaterialController;
