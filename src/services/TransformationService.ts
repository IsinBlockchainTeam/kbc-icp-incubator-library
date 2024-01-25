import { AssetOperation } from '../entities/AssetOperation.test';
import { AssetOperationDriver } from '../drivers/AssetOperationDriver';

export class TransformationService {
    private _transformationDriver: AssetOperationDriver;

    constructor(transformationDriver: AssetOperationDriver) {
        this._transformationDriver = transformationDriver;
    }

    async registerTransformation(companyAddress: string, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._transformationDriver.registerTransformation(companyAddress, name, inputMaterialsIds, outputMaterialId);
    }

    async updateTransformation(id: number, name: string, inputMaterialsIds: number[], outputMaterialId: number): Promise<void> {
        await this._transformationDriver.updateTransformation(id, name, inputMaterialsIds, outputMaterialId);
    }

    async getTransformationsCounter(): Promise<number> {
        return this._transformationDriver.getTransformationsCounter();
    }

    async getTransformation(id: number): Promise<AssetOperation> {
        return this._transformationDriver.getTransformation(id);
    }

    async getTransformations(owner: string): Promise<AssetOperation[]> {
        const transformations: AssetOperation[] = [];
        const transformationIds = await this._transformationDriver.getTransformationIds(owner);
        for (let i = 0; i < transformationIds.length; i++) {
            transformations.push(await this.getTransformation(transformationIds[i]));
        }
        return transformations;
    }
}
