import { IDL, query, update } from 'azle';
import EnumerationService from '../services/EnumerationService';
import { Enumeration } from '../models/Enumeration';

class EnumerationController {
    @query([Enumeration], IDL.Vec(IDL.Text))
    getEnumerationsByType(enumeration: Enumeration): string[] {
        return EnumerationService.instance.getEnumerationsByType(enumeration);
    }

    @update([Enumeration, IDL.Text])
    addEnumerationValue(enumeration: Enumeration, value: string): void {
        EnumerationService.instance.addEnumerationValue(enumeration, value);
    }

    @update([Enumeration, IDL.Text])
    removeEnumerationValue(enumeration: Enumeration, value: string): void {
        EnumerationService.instance.removeEnumerationValue(enumeration, value);
    }

    @query([Enumeration, IDL.Text], IDL.Bool)
    hasEnumerationValue(enumeration: Enumeration, value: string): boolean {
        return EnumerationService.instance.hasEnumerationValue(enumeration, value);
    }
}

export default EnumerationController;
