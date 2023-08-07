import {SupplyChainDriver} from "../drivers/SupplyChainDriver";
import {Material} from "../entities/Material";
import {Trade} from "../entities/Trade";
import {Transformation} from "../entities/Transformation";

export class SupplyChainService {
    private _supplyChainDriver: SupplyChainDriver;

    constructor(supplyChainDriver: SupplyChainDriver) {
        this._supplyChainDriver = supplyChainDriver;
    }

    async registerMaterial(companyAddress: string, name: string): Promise<void> {
        await this._supplyChainDriver.registerMaterial(companyAddress, name);
    }

    async registerTrade(companyAddress: string, name: string, materialsIds: [number, number][]): Promise<void> {
        await this._supplyChainDriver.registerTrade(companyAddress, name, materialsIds);
    }

    async registerTransformation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._supplyChainDriver.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
    }

    async updateMaterial(companyAddress: string, id: number, name: string): Promise<void> {
        await this._supplyChainDriver.updateMaterial(companyAddress, id, name);
    }

    async updateTrade(companyAddress: string, id: number, name: string, materialsIds: [number, number][]): Promise<void> {
        await this._supplyChainDriver.updateTrade(companyAddress, id, name, materialsIds);
    }

    async updateTransformation(companyAddress: string, id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._supplyChainDriver.updateTransformation(companyAddress, id, name, inputMaterialsIds, outputMaterialId);
    }

    async getMaterialsCounter(companyAddress: string): Promise<number> {
        return await this._supplyChainDriver.getMaterialsCounter(companyAddress);
    }

    async getTradesCounter(companyAddress: string): Promise<number> {
        return await this._supplyChainDriver.getTradesCounter(companyAddress);
    }

    async getTransformationsCounter(companyAddress: string): Promise<number> {
        return await this._supplyChainDriver.getTransformationsCounter(companyAddress);
    }

    async getMaterial(companyAddress: string, id: number): Promise<Material> {
        return await this._supplyChainDriver.getMaterial(companyAddress, id);
    }

    async getTrade(companyAddress: string, id: number): Promise<Trade> {
        return await this._supplyChainDriver.getTrade(companyAddress, id);
    }

    async getTransformation(companyAddress: string, id: number): Promise<Transformation> {
        return await this._supplyChainDriver.getTransformation(companyAddress, id);
    }

    async getMaterials(companyAddress: string): Promise<Material[]> {
        const materials: Material[] = [];
        const materialsCounter = await this._supplyChainDriver.getMaterialsCounter(companyAddress);
        for (let i = 0; i < materialsCounter; i++) {
            materials.push(await this.getMaterial(companyAddress, i));
        }
        return materials;
    }

    async getTrades(companyAddress: string): Promise<Trade[]> {
        const trades: Trade[] = [];
        const tradesCounter = await this._supplyChainDriver.getTradesCounter(companyAddress);
        for (let i = 0; i < tradesCounter; i++) {
            trades.push(await this.getTrade(companyAddress, i));
        }
        return trades;
    }

    async getTransformations(companyAddress: string): Promise<Transformation[]> {
        const transformations: Transformation[] = [];
        const transformationsCounter = await this._supplyChainDriver.getTransformationsCounter(companyAddress);
        for (let i = 0; i < transformationsCounter; i++) {
            transformations.push(await this.getTransformation(companyAddress, i));
        }
        return transformations;
    }
}
