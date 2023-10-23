import { MaterialDriver } from '../drivers/MaterialDriver';
import { Material } from '../entities/Material';

export class MaterialService {
    private _materialDriver: MaterialDriver;

    constructor(supplyChainDriver: MaterialDriver) {
        this._materialDriver = supplyChainDriver;
    }

    async registerMaterial(companyAddress: string, name: string): Promise<void> {
        await this._materialDriver.registerMaterial(companyAddress, name);
    }

    async updateMaterial(id: number, name: string): Promise<void> {
        await this._materialDriver.updateMaterial(id, name);
    }

    async getMaterialsCounter(): Promise<number> {
        return this._materialDriver.getMaterialsCounter();
    }

    async getMaterial(id: number): Promise<Material> {
        return this._materialDriver.getMaterial(id);
    }

    async getMaterials(owner: string): Promise<Material[]> {
        const materials: Material[] = [];
        const materialIds = await this._materialDriver.getMaterialIds(owner);
        for (let i = 0; i < materialIds.length; i++) {
            materials.push(await this.getMaterial(materialIds[i]));
        }
        return materials;
    }
}
