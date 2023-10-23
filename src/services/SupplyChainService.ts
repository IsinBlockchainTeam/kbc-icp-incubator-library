import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import { Material } from '../entities/Material';

export class SupplyChainService {
    private _supplyChainDriver: SupplyChainDriver;

    constructor(supplyChainDriver: SupplyChainDriver) {
        this._supplyChainDriver = supplyChainDriver;
    }

    async registerMaterial(companyAddress: string, name: string): Promise<void> {
        await this._supplyChainDriver.registerMaterial(companyAddress, name);
    }

    async updateMaterial(id: number, name: string): Promise<void> {
        await this._supplyChainDriver.updateMaterial(id, name);
    }

    async getMaterialsCounter(): Promise<number> {
        return this._supplyChainDriver.getMaterialsCounter();
    }

    async getMaterial(id: number): Promise<Material> {
        return this._supplyChainDriver.getMaterial(id);
    }

    async getMaterials(owner: string): Promise<Material[]> {
        const materials: Material[] = [];
        const materialIds = await this._supplyChainDriver.getMaterialIds(owner);
        for (let i = 0; i < materialIds.length; i++) {
            materials.push(await this.getMaterial(materialIds[i]));
        }
        return materials;
    }
}
