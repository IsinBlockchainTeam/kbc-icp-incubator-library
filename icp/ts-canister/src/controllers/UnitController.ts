import { IDL, query, update } from 'azle';
import UnitService from '../services/UnitService';
import { AtLeastSigner, AtLeastViewer } from '../decorators/roles';

export class UnitController {
    @query([], IDL.Vec(IDL.Text))
    @AtLeastViewer
    async getAllUnits(): Promise<string[]> {
        return UnitService.instance.getAllValues();
    }

    @update([IDL.Text])
    @AtLeastSigner
    async addUnit(value: string): Promise<void> {
        UnitService.instance.addValue(value);
    }

    @update([IDL.Text])
    @AtLeastSigner
    async removeUnit(value: string): Promise<void> {
        UnitService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    @AtLeastViewer
    async hasUnit(value: string): Promise<boolean> {
        return UnitService.instance.hasValue(value);
    }
}
