import { SupplyChainDriver } from '../drivers/SupplyChainDriver';
import { Material } from '../entities/Material';
import { Transformation } from '../entities/Transformation';

export class SupplyChainService {
    private _supplyChainDriver: SupplyChainDriver;

    constructor(supplyChainDriver: SupplyChainDriver) {
        this._supplyChainDriver = supplyChainDriver;
    }

    async registerMaterial(companyAddress: string, name: string): Promise<void> {
        await this._supplyChainDriver.registerMaterial(companyAddress, name);
    }

    async registerTransformation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._supplyChainDriver.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
    }

    async updateMaterial(id: number, name: string): Promise<void> {
        await this._supplyChainDriver.updateMaterial(id, name);
    }

    async updateTransformation(id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._supplyChainDriver.updateTransformation(id, name, inputMaterialsIds, outputMaterialId);
    }

    async getMaterialsCounter(): Promise<number> {
        return this._supplyChainDriver.getMaterialsCounter();
    }

    async getTransformationsCounter(): Promise<number> {
        return this._supplyChainDriver.getTransformationsCounter();
    }

    async getMaterial(id: number): Promise<Material> {
        return this._supplyChainDriver.getMaterial(id);
    }

    async getTransformation(id: number): Promise<Transformation> {
        return this._supplyChainDriver.getTransformation(id);
    }

    async getMaterials(): Promise<Material[]> {
        const materials: Material[] = [];
        const materialsCounter = await this._supplyChainDriver.getMaterialsCounter();
        for (let i = 1; i <= materialsCounter; i++) {
            materials.push(await this.getMaterial(i));
        }
        return materials;
    }

    async getTransformations(): Promise<Transformation[]> {
        const transformations: Transformation[] = [];
        const transformationsCounter = await this._supplyChainDriver.getTransformationsCounter();
        for (let i = 1; i <= transformationsCounter; i++) {
            transformations.push(await this.getTransformation(i));
        }
        return transformations;
    }
}
