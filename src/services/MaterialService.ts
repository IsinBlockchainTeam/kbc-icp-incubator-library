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

    async createMaterial(name: string, productCategoryId: number, typology: string, quality: string, moisture: string, isInput: boolean): Promise<Material> {
        return this._materialDriver.createMaterial(name, productCategoryId, typology, quality, moisture, isInput);
    }

    async updateMaterial(id: number, name: string, productCategoryId: number, typology: string, quality: string, moisture: string, isInput: boolean) {
        return this._materialDriver.updateMaterial(id, name, productCategoryId, typology, quality, moisture, isInput);
    }
}
