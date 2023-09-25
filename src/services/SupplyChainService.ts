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

    async updateMaterial(companyAddress: string, id: number, name: string): Promise<void> {
        await this._supplyChainDriver.updateMaterial(companyAddress, id, name);
    }

    async updateTransformation(companyAddress: string, id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._supplyChainDriver.updateTransformation(companyAddress, id, name, inputMaterialsIds, outputMaterialId);
    }

    async getMaterialsCounter(companyAddress: string): Promise<number> {
        return this._supplyChainDriver.getMaterialsCounter(companyAddress);
    }

    async getTransformationsCounter(companyAddress: string): Promise<number> {
        return this._supplyChainDriver.getTransformationsCounter(companyAddress);
    }

    async getMaterial(companyAddress: string, id: number): Promise<Material> {
        return this._supplyChainDriver.getMaterial(companyAddress, id);
    }

    async getTransformation(companyAddress: string, id: number): Promise<Transformation> {
        return this._supplyChainDriver.getTransformation(companyAddress, id);
    }

    async getMaterials(companyAddress: string): Promise<Material[]> {
        const materials: Material[] = [];
        const materialsCounter = await this._supplyChainDriver.getMaterialsCounter(companyAddress);
        for (let i = 1; i <= materialsCounter; i++) {
            materials.push(await this.getMaterial(companyAddress, i));
        }
        return materials;
    }

    async getTransformations(companyAddress: string): Promise<Transformation[]> {
        const transformations: Transformation[] = [];
        const transformationsCounter = await this._supplyChainDriver.getTransformationsCounter(companyAddress);
        for (let i = 1; i <= transformationsCounter; i++) {
            transformations.push(await this.getTransformation(companyAddress, i));
        }
        return transformations;
    }
}
