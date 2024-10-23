import { IDL, query, update } from 'azle';
import {
    Material as IDLMaterial,
    RoleProof as IDLRoleProof
} from "../models/idls";
import {
    Material, RoleProof
} from "../models/types";
import MaterialService from "../services/MaterialService";
import {OnlyEditor, OnlyViewer} from "../decorators/roles";

class MaterialController {
    @query([IDLRoleProof], IDL.Vec(IDLMaterial))
    @OnlyViewer
    async getMaterials(_: RoleProof): Promise<Material[]> {
        return MaterialService.instance.getMaterials();
    }

    @query([IDLRoleProof, IDL.Nat], IDLMaterial)
    @OnlyViewer
    async getMaterial(_: RoleProof, id: bigint): Promise<Material> {
        return MaterialService.instance.getMaterial(id);
    }

    @update([IDLRoleProof, IDL.Nat], IDLMaterial)
    @OnlyEditor
    async createMaterial(_: RoleProof, productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.createMaterial(productCategoryId);
    }

    @update([IDLRoleProof, IDL.Nat, IDL.Nat], IDLMaterial)
    @OnlyEditor
    async updateMaterial(_: RoleProof, id: bigint, productCategoryId: bigint): Promise<Material> {
        return MaterialService.instance.updateMaterial(id, productCategoryId);
    }
}

export default MaterialController;
