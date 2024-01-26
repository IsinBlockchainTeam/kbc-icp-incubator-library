import { MaterialDriver } from '../drivers/MaterialDriver';
import { Material } from '../entities/Material';

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

    async getMaterial(id: number): Promise<Material> {
        return this._materialDriver.getMaterial(id);
    }

    async getMaterials(): Promise<Material[]> {
        return this._materialDriver.getMaterials();
    }

    async getMaterialsOfCreator(creator: string): Promise<Material[]> {
        return this._materialDriver.getMaterialsOfCreator(creator);
    }

    async registerMaterial(productCategoryId: number): Promise<Material> {
        return this._materialDriver.registerMaterial(productCategoryId);
    }

    async updateMaterial(id: number, productCategoryId: number): Promise<Material> {
        return this._materialDriver.updateMaterial(id, productCategoryId);
    }
}
