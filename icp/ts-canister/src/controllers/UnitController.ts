import { IDL, query, update } from 'azle';
import UnitService from '../services/UnitService';

export class UnitController {
    @query([], IDL.Vec(IDL.Text))
    getAllUnits(): string[] {
        return UnitService.instance.getAllValues();
    }

    @update([IDL.Text])
    addUnit(value: string): void {
        UnitService.instance.addValue(value);
    }

    @update([IDL.Text])
    removeUnit(value: string): void {
        UnitService.instance.removeValue(value);
    }

    @query([IDL.Text], IDL.Bool)
    hasUnit(value: string): boolean {
        return UnitService.instance.hasValue(value);
    }
}
