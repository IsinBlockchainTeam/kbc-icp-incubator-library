import { Transformation } from '../entities/Transformation';
import { TransformationDriver } from '../drivers/TransformationDriver';

export class TransformationService {
    private _transformationDriver: TransformationDriver;

    constructor(transformationDriver: TransformationDriver) {
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

    async getTransformation(id: number): Promise<Transformation> {
        return this._transformationDriver.getTransformation(id);
    }

    async getTransformations(owner: string): Promise<Transformation[]> {
        const transformations: Transformation[] = [];
        const transformationIds = await this._transformationDriver.getTransformationIds(owner);
        for (let i = 0; i < transformationIds.length; i++) {
            transformations.push(await this.getTransformation(transformationIds[i]));
        }
        return transformations;
    }
}
