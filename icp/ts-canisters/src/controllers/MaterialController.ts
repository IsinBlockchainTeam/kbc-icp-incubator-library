import { IDL, query, update } from 'azle';
import { IDLMaterial } from '../models/idls';
import { Material } from '../models/types';
import MaterialService from '../services/MaterialService';
import { AtLeastEditor, AtLeastViewer } from '../decorators/roles';

class MaterialController {
    @query([], IDL.Vec(IDLMaterial))
    @AtLeastViewer
    async getMaterials(): Promise<Material[]> {
        return MaterialService.instance.getMaterials();
    }

    @query([IDL.Nat], IDLMaterial)
    @AtLeastViewer
    async getMaterial(id: bigint): Promise<Material> {
        return MaterialService.instance.getMaterial(id);
    }

    @update([IDL.Nat, IDL.Text, IDL.Text, IDL.Text], IDLMaterial)
    @AtLeastEditor
    async createMaterial(productCategoryId: bigint, typology: string, quality: string, moisture: string): Promise<Material> {
        return MaterialService.instance.createMaterial(
            productCategoryId,
            typology,
            quality,
            moisture
        );
    }

    @update([IDL.Nat, IDL.Nat, IDL.Text, IDL.Text, IDL.Text], IDLMaterial)
    @AtLeastEditor
    async updateMaterial(id: bigint, productCategoryId: bigint, typology: string, quality: string, moisture: string): Promise<Material> {
        return MaterialService.instance.updateMaterial(
            id,
            productCategoryId,
            typology,
            quality,
            moisture
        );
    }
}

export default MaterialController;
