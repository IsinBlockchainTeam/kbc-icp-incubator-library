import { IDL, query, update } from 'azle';
import EnumerationService from '../services/EnumerationService';
import { Enumeration, EnumerationKey } from '../models/Enumeration';

class EnumerationController {
    @query([IDL.Text], IDL.Vec(IDL.Text))
    getEnumerationsByType(enumeration: EnumerationKey): string[] {
        return EnumerationService.instance.getEnumerationsByType(enumeration);
    }

    @update([Enumeration, IDL.Text])
    addEnumerationValue(enumeration: Enumeration, value: string): void {
        EnumerationService.instance.addEnumerationValue(enumeration, value);
    }
}

export default EnumerationController;
