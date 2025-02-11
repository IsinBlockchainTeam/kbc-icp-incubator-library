import { IDL, query, update } from 'azle';
import { IDLMaterial } from '../models/idls';
import { Material } from '../models/types';
import MaterialService from '../services/MaterialService';
import { AtLeastEditor, AtLeastViewer } from '../decorators/roles';
import {OnlyContractParty} from "../decorators/parties";

class MaterialController {
    @query([], IDL.Vec(IDLMaterial))
    @AtLeastViewer
    async getMaterials(): Promise<Material[]> {
        return MaterialService.instance.getMaterials();
    }

    @query([IDL.Nat], IDLMaterial)
    @AtLeastViewer
    // @OnlyContractParty(MaterialService.instance) TODO: check if this is needed
    async getMaterial(id: bigint): Promise<Material> {
        return MaterialService.instance.getMaterial(id);
    }

    @update([IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Bool], IDLMaterial)
    @AtLeastEditor
    async createMaterial(name: string, productCategoryId: bigint, typology: string, quality: string, moisture: string, isInput: boolean): Promise<Material> {
        return MaterialService.instance.createMaterial(
            name,
            productCategoryId,
            typology,
            quality,
            moisture,
            isInput
        );
    }

    @update([IDL.Nat, IDL.Text, IDL.Nat, IDL.Text, IDL.Text, IDL.Text, IDL.Bool], IDLMaterial)
    @AtLeastEditor
    @OnlyContractParty(MaterialService.instance)
    async updateMaterial(id: bigint, name: string, productCategoryId: bigint, typology: string, quality: string, moisture: string, isInput: boolean): Promise<Material> {
        return MaterialService.instance.updateMaterial(
            id,
            name,
            productCategoryId,
            typology,
            quality,
            moisture,
            isInput
        );
    }
}

export default MaterialController;
