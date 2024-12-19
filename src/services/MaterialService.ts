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

    async createMaterial(productCategoryId: number, typology: string, quality: string, moisture: string): Promise<Material> {
        return this._materialDriver.createMaterial(productCategoryId, typology, quality, moisture);
    }

    async updateMaterial(id: number, productCategoryId: number, typology: string, quality: string, moisture: string) {
        return this._materialDriver.updateMaterial(id, productCategoryId, typology, quality, moisture);
    }
}
