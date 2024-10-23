import {RoleProof} from "@kbc-lib/azle-types";
import {MaterialDriver} from "../../drivers/icp/MaterialDriver";
import {Material} from "../../entities/Material";

export class MaterialService {
    private readonly _productCategoryDriver: MaterialDriver;

    constructor(productCategoryDriver: MaterialDriver) {
        this._productCategoryDriver = productCategoryDriver;
    }

    async getMaterials(roleProof: RoleProof): Promise<Material[]> {
        return this._productCategoryDriver.getMaterials(roleProof);
    }

    async getMaterial(roleProof: RoleProof, id: number): Promise<Material> {
        return this._productCategoryDriver.getMaterial(roleProof, id);
    }

    async createMaterial(roleProof: RoleProof, productCategoryId: number): Promise<Material> {
        return this._productCategoryDriver.createMaterial(roleProof, productCategoryId);
    }

    async updateMaterial(roleProof: RoleProof, id: number, productCategoryId: number) {
        return this._productCategoryDriver.updateMaterial(roleProof, id, productCategoryId);
    }
}
