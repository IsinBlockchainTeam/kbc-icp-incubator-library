import {MaterialDriver} from "../../drivers/icp/MaterialDriver";
import {Material} from "../../entities/Material";

export class MaterialService {
    private readonly _productCategoryDriver: MaterialDriver;

    constructor(productCategoryDriver: MaterialDriver) {
        this._productCategoryDriver = productCategoryDriver;
    }

    async getMaterials(): Promise<Material[]> {
        return this._productCategoryDriver.getMaterials();
    }

    async getMaterial(id: number): Promise<Material> {
        return this._productCategoryDriver.getMaterial(id);
    }

    async createMaterial(productCategoryId: number): Promise<Material> {
        return this._productCategoryDriver.createMaterial(productCategoryId);
    }

    async updateMaterial(id: number, productCategoryId: number) {
        return this._productCategoryDriver.updateMaterial(id, productCategoryId);
    }
}
