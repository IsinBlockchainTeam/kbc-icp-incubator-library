import { MaterialDriver } from '../drivers/MaterialDriver';
import { Material } from '../entities/Material';

export class MaterialService {
    private readonly _materialDriver: MaterialDriver;

    constructor(productCategoryDriver: MaterialDriver) {
        this._materialDriver = productCategoryDriver;
    }

    async getMaterials(): Promise<Material[]> {
        return this._materialDriver.getMaterials();
    }

    async getMaterial(id: number): Promise<Material> {
        return this._materialDriver.getMaterial(id);
    }

    async createMaterial(productCategoryId: number): Promise<Material> {
        return this._materialDriver.createMaterial(productCategoryId);
    }

    async updateMaterial(id: number, productCategoryId: number) {
        return this._materialDriver.updateMaterial(id, productCategoryId);
    }
}
