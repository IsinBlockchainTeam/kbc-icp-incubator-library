import { IDL, query, update } from 'azle';
import { AtLeastViewer } from '../decorators/roles';
import SustainabilityCriteriaService from '../services/SustainabilityCriteriaService';

class SustainabilityCriteriaController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllSustainabilityCriteria(): Promise<string[]> {
        return SustainabilityCriteriaService.instance.getAllValues();
    }

    @update([IDL.Text], IDL.Text)
    async addSustainabilityCriteria(value: string): Promise<string> {
        return SustainabilityCriteriaService.instance.addValue(value);
    }

    @update([IDL.Text], IDL.Text)
    async removeSustainabilityCriteria(value: string): Promise<string> {
        return SustainabilityCriteriaService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasSustainabilityCriteria(value: string): Promise<boolean> {
        return SustainabilityCriteriaService.instance.hasValue(value);
    }
}

export default SustainabilityCriteriaController;
