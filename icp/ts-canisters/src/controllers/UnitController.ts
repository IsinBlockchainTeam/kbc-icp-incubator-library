import { IDL, query, update } from 'azle';
import UnitService from '../services/UnitService';
import { AtLeastViewer } from '../decorators/roles';

class UnitController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllUnits(): Promise<string[]> {
        return UnitService.instance.getAllValues();
    }

    @update([IDL.Text, IDL.Text], IDL.Text)
    async addUnit(value: string, industrialSector: string): Promise<string> {
        return UnitService.instance.addValue(value, industrialSector);
    }

    @update([IDL.Text, IDL.Text], IDL.Text)
    async removeUnit(value: string, industrialSector: string): Promise<string> {
        return UnitService.instance.removeValue(value, industrialSector);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasUnit(value: string): Promise<boolean> {
        return UnitService.instance.hasValue(value);
    }
}

export default UnitController;
