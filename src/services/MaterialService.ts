import { MaterialDriver } from '../drivers/MaterialDriver';
import { Material } from '../entities/Material';
import { RoleProof } from '../types/RoleProof';

export class MaterialService {
    private _materialDriver: MaterialDriver;

    constructor(supplyChainDriver: MaterialDriver) {
        this._materialDriver = supplyChainDriver;
    }

    async getMaterialsCounter(): Promise<number> {
        return this._materialDriver.getMaterialsCounter();
    }

    async getMaterialExists(id: number): Promise<boolean> {
        return this._materialDriver.getMaterialExists(id);
    }

    async getMaterial(roleProof: RoleProof, id: number): Promise<Material> {
        return this._materialDriver.getMaterial(roleProof, id);
    }

    async getMaterials(roleProof: RoleProof): Promise<Material[]> {
        return this._materialDriver.getMaterials(roleProof);
    }

    async getMaterialsOfCreator(roleProof: RoleProof, creator: string): Promise<Material[]> {
        return this._materialDriver.getMaterialsOfCreator(roleProof, creator);
    }

    async registerMaterial(roleProof: RoleProof, productCategoryId: number): Promise<number> {
        return this._materialDriver.registerMaterial(roleProof, productCategoryId);
    }

    async updateMaterial(
        roleProof: RoleProof,
        id: number,
        productCategoryId: number
    ): Promise<void> {
        return this._materialDriver.updateMaterial(roleProof, id, productCategoryId);
    }
}
